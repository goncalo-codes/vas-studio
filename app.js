// var ambiente_processo = 'producao';
var ambiente_processo = 'desenvolvimento';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
// Acima, temos o uso do operador ternário para definir o caminho do arquivo .env
// A sintaxe do operador ternário é: condição ? valor_se_verdadeiro : valor_se_falso

require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");
var session = require('express-session');  // Importando o express-session
var PORTA_APP = process.env.APP_PORT;
var HOST_APP = process.env.APP_HOST;

var app = express();

var lojaSomRouter = require("./src/routes/lojaSom");
const ffmpegRoutes = require("./src/routes/ffmpegRoutes");

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_forte_aqui', // Use uma variável de ambiente
    resave: false,
    saveUninitialized: false, // Mude para false por segurança
    cookie: {
        secure: false, // true em produção com HTTPS
        httpOnly: true,
        sameSite: 'lax', // ou 'none' se precisar de cross-site
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
        path: '/' // Disponível em todas as rotas
    }
}));

//FFMPEG
app.use("/api/video", ffmpegRoutes);
app.use('/output', express.static(path.join(__dirname, 'output'), {
    setHeaders: (res, path) => {
        res.set('Content-Disposition', 'attachment');
    }
}));


///
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
    origin: true, // ou especifique seu domínio
    credentials: true // Permite envio de cookies
}));

app.use("/lojasom", lojaSomRouter);

app.listen(PORTA_APP, function () {
    console.log(`                                                                                  
    Servidor do seu site já está rodando! Acesse o caminho a seguir para visualizar .: http://${HOST_APP}:${PORTA_APP} :. \n\n
    Você está rodando sua aplicação em ambiente de .:${process.env.AMBIENTE_PROCESSO}:. \n\n`);
});