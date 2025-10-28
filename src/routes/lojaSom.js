var express = require("express");
var router = express.Router();

var lojaSomController = require("../controllers/lojaSomController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.post("/cadastrar", function (req, res) {
    lojaSomController.cadastrar(req, res);
})

router.post("/autenticar", function (req, res) {
    lojaSomController.autenticar(req, res);
});

router.get("/listarSons", function (req, res) {
    lojaSomController.listar(req, res);
});

router.post("/comprar", function (req, res) {
    lojaSomController.comprar(req, res);
});

router.get("/usuarioLogado", (req, res) => {
    if (req.session.usuarioId) {
        res.json({ usuarioId: req.session.usuarioId }); // Retorna o ID do usuário logado
    } else {
        res.status(401).send("Usuário não autenticado."); // Retorna erro caso não haja sessão
    }
});

router.get("/listarSonsComprados", function (req, res) {
    lojaSomController.listarSonsComprados(req, res);
});

router.get("/listarSonsLogado", function (req, res) {
    lojaSomController.listarLogado(req, res);
});

router.get("/listarPacotesComSons", function (req, res) {
    lojaSomController.listarPacotesComSons(req, res);
});

router.get("/listarPacotesLogado", function (req, res) {
    lojaSomController.listarPacotesLogado(req, res);
});

router.get("/listarPacotesComprados", function (req, res) {
    lojaSomController.listarPacotesComprados(req, res);
});

module.exports = router;