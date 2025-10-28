// Variáveis globais
let selectedAudios = [];
let audioPlayers = {};
let currentPlayingAudio = null;

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  initializeUI();
});

function initializeUI() {
  setupHoverEffects();
  setupFileUpload();
  setupPopup();
  setupFormSubmission();
}

function setupHoverEffects() {
  const buttons = document.querySelectorAll("button, .download-button");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      button.style.transform = "translateY(-2px)";
      button.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translateY(0)";
      button.style.boxShadow = "none";
    });
  });
}

function setupFileUpload() {
  const videoInput = document.getElementById("videoInput");
  videoInput.addEventListener("change", (e) => {
    const fileName = e.target.files[0]?.name || "Nenhum arquivo selecionado";
    document.getElementById("videoFileName").textContent = fileName;
  });
}

function setupPopup() {
  const audioAddButton = document.getElementById("btnAddAudio");
  const popup = document.getElementById("popup2");
  const closePopupButton = document.getElementById("close-popup2");

  audioAddButton.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "flex";
    exibirSonsComprados();
  });

  closePopupButton.addEventListener("click", () => {
    popup.style.display = "none";
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
}

function setupFormSubmission() {
  const form = document.getElementById("uploadForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await processVideo();
  });
}

async function processVideo() {
  const button = document.getElementById("processButton");
  const statusDiv = document.getElementById("status");
  const downloadLink = document.getElementById("downloadLink");
  const videoInput = document.getElementById("videoInput");

  // Validações
  if (!videoInput.files[0]) {
    showError(statusDiv, "Por favor, selecione um vídeo!");
    return;
  }

  if (selectedAudios.length === 0) {
    showError(statusDiv, "Por favor, selecione pelo menos um áudio!");
    return;
  }

  button.disabled = true;
  statusDiv.textContent = "Processando vídeo...";
  statusDiv.className = "status-message processing";
  downloadLink.style.display = "none";

  try {
    const formData = new FormData();
    formData.append("video", videoInput.files[0]);

    // Prepara os dados dos áudios
    const audiosData = selectedAudios.map((audio) => {
      const audioElement = document.querySelector(
        `.selected-audio[data-audio-id="${audio.id}"]`
      );
      return {
        path: audio.caminho.split("/").pop(),
        duration:
          parseFloat(audioElement.querySelector(".audio-duration").value) || 2,
        delay:
          parseInt(audioElement.querySelector(".audio-delay").value) || 1000,
        volume:
          parseFloat(audioElement.querySelector(".audio-volume").value) || 1.0,
        speed:
          parseFloat(audioElement.querySelector(".audio-speed").value) || 1.0,
      };
    });

    formData.append("audiosData", JSON.stringify(audiosData));

    const response = await fetch("/api/video/processar-video", {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Resposta do servidor não é JSON");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Erro ao processar vídeo");
    }

    if (!data.downloadUrl) {
      throw new Error("URL de download não recebida do servidor");
    }

    const downloadUrl = data.downloadUrl.startsWith("http")
      ? data.downloadUrl
      : `${window.location.origin}${data.downloadUrl}`;

    // Força o download
    const tempLink = document.createElement("a");
    tempLink.href = downloadUrl;
    tempLink.download = downloadUrl.split("/").pop();
    tempLink.click();

    // Atualiza o link visível
    downloadLink.href = downloadUrl;
    downloadLink.download = tempLink.download;
    downloadLink.style.display = "flex";

    statusDiv.textContent = "Vídeo processado com sucesso!";
    statusDiv.className = "status-message success";
  } catch (err) {
    console.error("Erro detalhado:", err);
    showError(statusDiv, err.message || "Erro ao processar vídeo");
  } finally {
    button.disabled = false;
  }
}

function showError(element, message) {
  element.textContent = message;
  element.className = "status-message error";
  element.style.animation = "shake 0.5s";
  setTimeout(() => {
    element.style.animation = "";
  }, 500);
}

// Função para exibir sons comprados
async function exibirSonsComprados() {
  try {
    const statusElement = document.getElementById("son-list");
    statusElement.innerHTML =
      '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';

    const sons = await buscarSonsCompradosDaAPI();
    const sonListContainer = document.getElementById("son-list");

    if (Array.isArray(sons) && sons.length > 0) {
      sonListContainer.innerHTML = "";

      sons.forEach((som) => {
        const sonDiv = document.createElement("div");
        sonDiv.className = "son-item";
        sonDiv.innerHTML = `
                    <h3>${som.nome}</h3>
                    <div class="audio-controls">
                        <button class="play-button" data-som-id="${som.id}">
                            <i class="fas fa-play"></i> Ouvir
                        </button>
                        <button class="add-button" data-som-id="${som.id}">
                            <i class="fas fa-check"></i> Selecionar
                        </button>
                    </div>
                    <audio class="audio-player" data-som-id="${som.id}" style="display: none;">
                        <source src="${som.caminho}" type="audio/mpeg">
                    </audio>
                `;

        sonListContainer.appendChild(sonDiv);
        setupAudioControls(sonDiv, som);
      });
    } else {
      sonListContainer.innerHTML = `
                <div class="no-audios">
                    <i class="fas fa-music"></i>
                    <p>Você não comprou nenhum som ainda.</p>
                    <a href="sonsLogado.html" class="browse-link">
                        <i class="fas fa-store"></i> Explorar Loja de Sons
                    </a>
                </div>
            `;
    }
  } catch (error) {
    console.error("Erro ao exibir sons:", error);
    document.getElementById("son-list").innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ocorreu um erro ao carregar os sons.</p>
                <button class="retry-button" onclick="exibirSonsComprados()">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            </div>
        `;
  }
}

// Configura controles de áudio
function setupAudioControls(container, som) {
  const playButton = container.querySelector(".play-button");
  const audio = container.querySelector(".audio-player");
  const addButton = container.querySelector(".add-button");

  audioPlayers[som.id] = audio;

  // Atualiza o estado do botão se o áudio já estiver selecionado
  if (selectedAudios.some((a) => a.id === som.id)) {
    addButton.innerHTML = '<i class="fas fa-check-circle"></i> Selecionado';
    addButton.style.backgroundColor = "#27ae60";
  }

  playButton.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAudioPlayback(som.id, playButton);
  });

  addButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (selectedAudios.some((a) => a.id === som.id)) {
      // Se já está selecionado, remove
      removerAudioSelecionado(som.id);
      addButton.innerHTML = '<i class="fas fa-check"></i> Selecionar';
      addButton.style.backgroundColor = "";
    } else {
      // Se não está selecionado, adiciona
      selecionarAudio(som);
    }
  });

  audio.addEventListener("ended", () => {
    playButton.innerHTML = '<i class="fas fa-play"></i> Ouvir';
    playButton.classList.remove("playing");
  });
}

// Função para selecionar um áudio
// Função para selecionar um áudio
function selecionarAudio(som) {
  if (selectedAudios.length >= 6) {
    alert("Você já selecionou o número máximo de áudios (6)");
    return;
  }

  if (selectedAudios.some((a) => a.id === som.id)) {
    return; // Já está selecionado
  }

  selectedAudios.push(som);
  atualizarListaAudios();
  animateSelection();

  // Atualiza o botão no modal
  const addButton = document.querySelector(
    `.add-button[data-som-id="${som.id}"]`
  );
  if (addButton) {
    addButton.innerHTML = '<i class="fas fa-check-circle"></i> Selecionado';
    addButton.style.backgroundColor = "#27ae60";
  }
}

// Atualiza a lista de áudios na UI
function atualizarListaAudios() {
  const container = document.getElementById("selectedAudiosContainer");

  if (selectedAudios.length === 0) {
    container.innerHTML =
      '<p id="noAudioSelected"><i class="fas fa-music"></i> Nenhum áudio selecionado</p>';
    return;
  }

  container.innerHTML = "";

  selectedAudios.forEach((som, index) => {
    const audioDiv = document.createElement("div");
    audioDiv.className = "selected-audio";
    audioDiv.dataset.audioId = som.id;
    audioDiv.innerHTML = `
      <div class="audio-info">
          <i class="fas fa-music"></i>
          <div class="audio-details">
              <h4>${index + 1}. ${som.nome}</h4>
              <div class="audio-controls">
                  <div class="control-group">
                      <label>Duração (s)</label>
                      <input type="number" class="audio-duration" value="2" min="0" step="0.1">
                  </div>
                  <div class="control-group">
                      <label>Atraso (ms)</label>
                      <input type="number" class="audio-delay" value="1000" min="0">
                  </div>
                  <div class="control-group">
                      <label>Volume (0.0-10.0)</label>
                      <input type="number" class="audio-volume" value="1.0" min="0" max="10" step="0.1">
                  </div>
                  <div class="control-group">
                      <label>Velocidade (0.5-2.0)</label>
                      <input type="number" class="audio-speed" value="1.0" min="0.5" max="2.0" step="0.1">
                  </div>
              </div>
          </div>
      </div>
      <div style = "margin-top:55px " class="audio-actions">
          <button style = "margin-left:20px "class="play-selected" data-audio-id="${
            som.id
          }">
              <i class="fas fa-play"></i>
          </button>
          <button class="remove-selected" data-audio-id="${som.id}">
              <i class="fas fa-times"></i>
          </button>
      </div>
    `;
    container.appendChild(audioDiv);
  });

  setupSelectedAudiosControls();
}

// Configura controles dos áudios selecionados
function setupSelectedAudiosControls() {
  document.querySelectorAll(".remove-selected").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const audioId = button.getAttribute("data-audio-id");
      removerAudioSelecionado(audioId);
    });
  });

  // Remove event listeners antigos antes de adicionar novos
  document.querySelectorAll(".play-selected").forEach((button) => {
    button.replaceWith(button.cloneNode(true));
  });

  // Configura os botões de play para os áudios selecionados
  document.querySelectorAll(".play-selected").forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const audioId = button.getAttribute("data-audio-id");
      const audioElement = document.querySelector(
        `audio[data-som-id="${audioId}"]`
      );

      if (!audioElement) {
        console.error("Elemento de áudio não encontrado");
        return;
      }

      // Pausa qualquer áudio que esteja tocando atualmente
      if (currentPlayingAudio && currentPlayingAudio !== audioElement) {
        currentPlayingAudio.pause();
        const currentButton = document.querySelector(
          `.play-selected[data-audio-id="${currentPlayingAudio.dataset.somId}"]`
        );
        if (currentButton) {
          currentButton.innerHTML = '<i class="fas fa-play"></i>';
          currentButton
            .closest(".selected-audio")
            ?.classList.remove("audio-playing");
        }
      }

      if (audioElement.paused) {
        try {
          await audioElement.play();
          button.innerHTML = '<i class="fas fa-pause"></i>';
          currentPlayingAudio = audioElement;
          button.closest(".selected-audio")?.classList.add("audio-playing");
        } catch (error) {
          console.error("Erro ao reproduzir áudio:", error);
          button.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
          setTimeout(() => {
            button.innerHTML = '<i class="fas fa-play"></i>';
          }, 2000);
        }
      } else {
        audioElement.pause();
        button.innerHTML = '<i class="fas fa-play"></i>';
        button.closest(".selected-audio")?.classList.remove("audio-playing");
        if (currentPlayingAudio === audioElement) {
          currentPlayingAudio = null;
        }
      }
    });
  });
}

// Remove um áudio selecionado
function removerAudioSelecionado(audioId) {
  // Converter audioId para número (caso esteja como string)
  audioId = Number(audioId);

  // Pausa o áudio se estiver tocando
  const playerElement = document.querySelector(
    `.audio-player[data-audio-id="${audioId}"]`
  );
  if (playerElement) {
    playerElement.pause();

    // Se era o áudio atual, limpa a referência
    if (
      currentPlayingAudio &&
      currentPlayingAudio.dataset.audioId === audioId.toString()
    ) {
      currentPlayingAudio = null;
    }
  }

  // Remove da lista de áudios selecionados
  selectedAudios = selectedAudios.filter((a) => a.id !== audioId);

  const addButton = document.querySelector(
    `.add-button[data-som-id="${audioId}"]`
  );
  if (addButton) {
    addButton.innerHTML = '<i class="fas fa-check"></i> Selecionar';
    addButton.style.backgroundColor = "";
  }

  // Atualiza a UI
  atualizarListaAudios();
}

// Animação de seleção
function animateSelection() {
  const container = document.getElementById("selectedAudiosContainer");
  container.style.transform = "scale(1.02)";
  container.style.boxShadow = "0 0 10px rgba(0,255,0,0.3)";

  setTimeout(() => {
    container.style.transform = "";
    container.style.boxShadow = "";
  }, 300);
}

// Controla a reprodução de áudio
function toggleAudioPlayback(audioId, button) {
  const audio = audioPlayers[audioId];

  // Pausa o áudio atual se estiver tocando
  if (currentPlayingAudio && currentPlayingAudio !== audio) {
    currentPlayingAudio.pause();
    const currentButton = document.querySelector(
      `.play-button[data-som-id="${currentPlayingAudio.dataset.somId}"]`
    );
    if (currentButton) {
      currentButton.innerHTML = '<i class="fas fa-play"></i> Ouvir';
      currentButton.classList.remove("playing");
    }
  }

  if (audio.paused) {
    audio
      .play()
      .then(() => {
        button.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        button.classList.add("playing");
        currentPlayingAudio = audio;
      })
      .catch((error) => {
        console.error("Erro ao reproduzir áudio:", error);
        showAudioError(button);
      });
  } else {
    audio.pause();
    button.innerHTML = '<i class="fas fa-play"></i> Ouvir';
    button.classList.remove("playing");
    if (currentPlayingAudio === audio) {
      currentPlayingAudio = null;
    }
  }
}

// Mostra erro de áudio
function showAudioError(button) {
  const icon = button.querySelector("i");
  const originalIcon = icon.className;

  icon.className = "fas fa-exclamation-circle";
  button.style.backgroundColor = "#e74c3c";

  setTimeout(() => {
    icon.className = originalIcon;
    button.style.backgroundColor = "";
  }, 2000);
}

// Formata duração (opcional)
function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Função para buscar sons comprados
async function buscarSonsCompradosDaAPI() {
  try {
    const response = await fetch("/lojaSom/listarSonsComprados");
    if (!response.ok) throw new Error("Erro ao buscar sons");

    const sons = await response.json();
    return sons.map((som) => ({
      ...som,
      caminho: `/ambienteSons/${som.caminho}`,
    }));
  } catch (erro) {
    console.error("Erro:", erro);
    throw erro;
  }
}
