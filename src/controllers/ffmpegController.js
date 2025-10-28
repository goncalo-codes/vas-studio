const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const multer = require("multer");

// Configuração do FFmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Configuração do multer para upload de vídeo
const upload = multer({ dest: "uploads/" });

// Cria a pasta de output se não existir
const outputDir = path.join(__dirname, "../../output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

exports.processarVideo = async (req, res) => {
  try {
    console.log("Iniciando processamento de vídeo...");

    // Verifica se o vídeo foi enviado
    if (!req.file) {
      console.error("Nenhum vídeo enviado");
      return res.status(400).json({
        success: false,
        error: "Nenhum vídeo enviado",
      });
    }

    // Parse dos dados dos áudios
    let audiosData = [];
    try {
      audiosData = JSON.parse(req.body.audiosData || "[]");
    } catch (e) {
      console.error("Erro ao parsear audiosData:", e);
      return res.status(400).json({
        success: false,
        error: "Formato inválido para dados dos áudios",
      });
    }

    console.log("Dados dos áudios recebidos:", audiosData);

    // Verifica se há áudios
    if (audiosData.length === 0) {
      console.error("Nenhum áudio selecionado");
      return res.status(400).json({
        success: false,
        error: "Nenhum áudio selecionado",
      });
    }

    // Validação dos áudios
    const projectRoot = path.join(__dirname, "../..");
    const validatedAudios = [];

    for (const audio of audiosData) {
      const absolutePath = path.join(
        projectRoot,
        "public",
        "ambienteSons",
        audio.path
      );

      // Verificação de segurança
      const validPath = path.join(projectRoot, "public", "ambienteSons");
      if (!absolutePath.startsWith(validPath)) {
        console.error("Caminho de áudio inválido:", absolutePath);
        return res.status(400).json({
          success: false,
          error: "Caminho de áudio inválido",
        });
      }

      if (!fs.existsSync(absolutePath)) {
        console.error("Arquivo de áudio não encontrado:", absolutePath);
        return res.status(400).json({
          success: false,
          error: `Arquivo de áudio não encontrado: ${audio.path}`,
        });
      }

      validatedAudios.push({
        path: absolutePath,
        duration: parseFloat(audio.duration) || 2,
        delay: parseInt(audio.delay) || 1000,
        volume: parseFloat(audio.volume) || 1.0, // Adicionado
        speed: parseFloat(audio.speed) || 1.0, // Adicionado
      });
    }

    // Processamento do vídeo
    const videoPath = req.file.path;
    const outputFilename = `video_editado_${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    console.log("Iniciando processamento FFmpeg...");
    console.log("Vídeo:", videoPath);
    console.log("Áudios:", validatedAudios);

    await new Promise((resolve, reject) => {
      const command = ffmpeg().input(videoPath).outputOptions("-map", "0:v"); // Mapeia o vídeo original

      // Adiciona cada áudio como input
      validatedAudios.forEach((audio) => {
        command.input(audio.path);
      });

      // Constrói os filtros para cada áudio
      const filters = [];
      const amixInputs = ["0:a"]; // Áudio original do vídeo

      validatedAudios.forEach((audio, index) => {
        const audioIndex = index + 1;
        const streamName = `aud${index}`;

        // Filtros para cada áudio
        filters.push({
          filter: "atrim",
          options: `end=${audio.duration}`,
          inputs: `${audioIndex}:a`,
          outputs: `${streamName}_trimmed`,
        });

        // Aplica velocidade (atempo)
        filters.push({
          filter: "atempo",
          options: audio.speed ? audio.speed.toString() : undefined, // Garante que é string
          inputs: `${streamName}_trimmed`,
          outputs: `${streamName}_sped`,
        });

        // Aplica volume
        filters.push({
          filter: "volume",
          options: audio.volume ? audio.volume.toString() : undefined, // Garante que é string
          inputs: `${streamName}_sped`,
          outputs: `${streamName}_vol`,
        });

        // Aplica delay
        filters.push({
          filter: "adelay",
          options: `${audio.delay}|${audio.delay}`,
          inputs: `${streamName}_vol`,
          outputs: streamName,
        });

        amixInputs.push(`[${streamName}]`);
      });

      // Adiciona o filtro de mixagem
      filters.push({
        filter: "amix",
        options: {
          inputs: amixInputs.length,
          duration: "first",
        },
        inputs: amixInputs,
        outputs: "audiofinal",
      });

      console.log("Filtros complexos:", filters);

      command
        .complexFilter(filters)
        .outputOptions([
          "-map",
          "[audiofinal]",
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-shortest",
        ])
        .on("start", (commandLine) => {
          console.log("Comando FFmpeg executado:", commandLine);
        })
        .on("progress", (progress) => {
          console.log(`Processando: ${Math.round(progress.percent)}%`);
        })
        .on("end", () => {
          console.log("Processamento concluído com sucesso!");
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          console.error("Erro no FFmpeg:", err);
          console.error("Saída FFmpeg (stdout):", stdout);
          console.error("Erro FFmpeg (stderr):", stderr);
          reject(new Error("Erro ao processar vídeo com FFmpeg"));
        })
        .save(outputPath);
    });

    console.log("Vídeo processado com sucesso:", outputPath);

    res.status(200).json({
      success: true,
      downloadUrl: `/output/${outputFilename}`,
    });
  } catch (err) {
    console.error("Erro no processamento:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Erro durante o processamento do vídeo",
    });
  } finally {
    // Limpa o arquivo temporário do vídeo
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};
