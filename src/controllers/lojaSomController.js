var lojaSomModel = require("../models/lojaSomModel");


function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    // Faça as validações dos valores
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else {

        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
        lojaSomModel.cadastrar(nome, email, senha)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined || senha == undefined) {
        res.status(400).send("Email ou senha estão indefinidos!");
    } else {
        lojaSomModel.autenticar(email, senha)
            .then(function (resultadoAutenticar) {
                if (resultadoAutenticar.length == 1) {
                    // Salva o ID do usuário na sessão
                    req.session.usuarioId = resultadoAutenticar[0].id; // Salve o usuário na sessão
                    res.json(resultadoAutenticar[0]); // Retorne os dados para o frontend
                } else {
                    res.status(403).send("Email e/ou senha inválido(s)");
                }
            })
            .catch(function (erro) {
                res.status(500).send(erro.sqlMessage);
            });
    }
}

function listar(req, res) {
    lojaSomModel.listar()
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum som encontrado!");
            }
        })
        .catch((erro) => {
            console.log(erro);
            console.log("\nHouve um erro ao buscar os sons! Erro:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarLogado(req, res) {
    const usuarioId = req.session.usuarioId;

    if (!usuarioId) {
        return res.status(401).send("Usuário não autenticado.");
    }

    lojaSomModel.listarLogado(usuarioId)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum som encontrado!");
            }
        })
        .catch((erro) => {
            console.log(erro);
            console.log("\nHouve um erro ao buscar os sons! Erro:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function comprar(req, res) {
    const { usuarioId, tipoCompra, itemId, precoTotal } = req.body;

    if (!usuarioId || !tipoCompra || !itemId || !precoTotal) {
        res.status(400).send("Todos os campos são obrigatórios!");
        return;
    }

    lojaSomModel
        .registrarCompra(usuarioId, tipoCompra, itemId, precoTotal)
        .then(() => {
            res.status(201).json({ mensagem: "Compra realizada com sucesso!" });
        })
        .catch((erro) => {
            console.error("Erro ao registrar compra:", erro);
            res.status(500).json({ erro: "Erro ao processar a compra." });
        });
}

function listarSonsComprados(req, res) {
    const usuarioId = req.session.usuarioId;

    if (!usuarioId) {
        return res.status(401).send("Usuário não autenticado.");
    }

    lojaSomModel.listarSonsComprados(usuarioId)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Você não comprou nenhum som ainda.");
            }
        })
        .catch((erro) => {
            console.log("\nHouve um erro ao buscar os sons comprados! Erro:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarPacotesComSons(req, res) {
    lojaSomModel.listarPacotesComSons()
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(
                    resultado.map(pacote => ({
                        ...pacote,
                        sons: pacote.sons ? JSON.parse(pacote.sons) : []
                    }))
                );
            } else {
                res.status(204).send("Nenhum pacote encontrado!");
            }
        })
        .catch((erro) => {
            console.error("Erro ao buscar pacotes com sons:", erro); // Log detalhado
            res.status(500).json({ mensagem: "Erro interno no servidor", erro: erro.message });
        });
}


async function comprar(req, res) {
    const { usuarioId, tipoCompra, itemId, precoTotal } = req.body;

    if (!usuarioId || !tipoCompra || !itemId || !precoTotal) {
        res.status(400).send("Todos os campos são obrigatórios!");
        return;
    }

    try {
        if (tipoCompra === 'pacote') {
            // Buscar os sons do pacote
            const sonsDoPacote = await lojaSomModel.listarSonsDoPacote(itemId);

            if (sonsDoPacote.length === 0) {
                return res.status(404).send("Pacote não contém sons.");
            }

            // Preparar as compras
            const compras = [
                { usuarioId, tipoCompra: 'pacote', itemId, precoTotal }, // Compra do pacote
                ...sonsDoPacote.map(som => ({
                    usuarioId,
                    tipoCompra: 'som',
                    itemId: som.id,
                    precoTotal: som.preco
                }))
            ];

            // Registrar as compras em lote
            await lojaSomModel.registrarComprasEmLote(compras);

            // Obter sons restantes
            const sonsRestantes = await lojaSomModel.listarLogado(usuarioId);

            res.status(201).json({
                mensagem: "Pacote e sons comprados com sucesso!",
                sonsRestantes
            });
        } else {
            // Compra de som individual
            await lojaSomModel.registrarCompra(usuarioId, tipoCompra, itemId, precoTotal);

            // Obter sons restantes
            const sonsRestantes = await lojaSomModel.listarLogado(usuarioId);

            res.status(201).json({
                mensagem: "Som comprado com sucesso!",
                sonsRestantes
            });
        }
    } catch (erro) {
        console.error("Erro ao registrar compra:", erro);
        res.status(500).json({ erro: "Erro ao processar a compra." });
    }
}
function listarPacotesLogado(req, res) {
    const usuarioId = req.session.usuarioId;

    if (!usuarioId) {
        return res.status(401).send("Usuário não autenticado.");
    }

    lojaSomModel.listarPacotesLogado(usuarioId)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(
                    resultado.map(pacote => ({
                        ...pacote,
                        sons: pacote.sons ? JSON.parse(pacote.sons) : []
                    }))
                );
            } else {
                res.status(204).send("Nenhum pacote disponível para compra.");
            }
        })
        .catch((erro) => {
            console.error("Erro ao listar pacotes:", erro);
            res.status(500).json({ mensagem: "Erro interno no servidor", erro: erro.message });
        });
}

function listarPacotesComprados(req, res) {
    const usuarioId = req.session.usuarioId;

    if (!usuarioId) {
        return res.status(401).send("Usuário não autenticado.");
    }

    lojaSomModel.listarPacotesComprados(usuarioId)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(
                    resultado.map(pacote => ({
                        ...pacote,
                        sons: pacote.sons ? JSON.parse(pacote.sons) : []
                    }))
                );
            } else {
                res.status(204).send("Você não comprou nenhum pacote ainda.");
            }
        })
        .catch((erro) => {
            console.log("\nHouve um erro ao buscar os pacotes comprados! Erro:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    autenticar,
    cadastrar,
    comprar,
    listarSonsComprados,
    listarLogado,
    listarPacotesComSons,
    listarPacotesLogado,
    listarPacotesComprados,
    listar
};