var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
        SELECT id, nome, email FROM usuarios WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
function cadastrar(nome, email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha);
    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    var instrucaoSql = `
        INSERT INTO usuarios (nome, email, senha) VALUES ('${nome}', '${email}', '${senha}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listar() {
    const instrucaoSql = `
        SELECT 
            id, 
            titulo AS nome, 
            categoria, 
            CONCAT('../ambienteSons/', caminho_arquivo) AS caminho, 
            preco 
        FROM sons;
    `;
    return database.executar(instrucaoSql);
}

function listarLogado(usuarioId) {
    const instrucaoSql = `
        SELECT 
            s.id, 
            s.titulo AS nome, 
            s.categoria, 
            CONCAT('../ambienteSons/', s.caminho_arquivo) AS caminho, 
            s.preco 
        FROM sons s
        WHERE s.id NOT IN (
            SELECT c.item_id
            FROM compras c
            WHERE c.usuario_id = ${usuarioId} AND c.tipo_compra = 'som'
        );
    `;
    return database.executar(instrucaoSql);
}

function registrarCompra(usuarioId, tipoCompra, itemId, precoTotal) {
    const instrucaoSql = `
        INSERT INTO compras (usuario_id, tipo_compra, item_id, preco_total) 
        VALUES (${usuarioId}, '${tipoCompra}', ${itemId}, ${precoTotal});
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarSonsComprados(usuarioId) {
    const instrucaoSql = `
        SELECT 
            s.id, 
            s.titulo AS nome, 
            s.categoria, 
            CONCAT('../ambienteSons/', s.caminho_arquivo) AS caminho, 
            s.preco 
        FROM sons s
        INNER JOIN compras c ON c.item_id = s.id
        WHERE c.usuario_id = ${usuarioId} AND c.tipo_compra = 'som';
    `;
    return database.executar(instrucaoSql);
}

function listarPacotesComSons() {
    const instrucaoSql = `
            SELECT 
            p.id AS pacote_id, 
            p.titulo, 
            p.categoria, 
            p.preco, 
            COALESCE(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id, 
                        'nome', s.titulo, 
                        'caminho', CONCAT('../ambienteSons/', s.caminho_arquivo)
                    )
                ),
                '[]'
            ) AS sons
        FROM pacotes_sons p
        LEFT JOIN pacote_sons_relacao psr ON p.id = psr.pacote_id
        LEFT JOIN sons s ON s.id = psr.som_id
        GROUP BY p.id;
    `;
    return database.executar(instrucaoSql);
}
function listarSonsDoPacote(pacoteId) {
    const instrucaoSql = `
        SELECT s.id, s.preco, s.categoria
        FROM pacote_sons_relacao psr
        INNER JOIN sons s ON psr.som_id = s.id
        WHERE psr.pacote_id = ${pacoteId};
    `;
    return database.executar(instrucaoSql);
}

function registrarComprasEmLote(compras) {
    const valores = compras.map(
        compra => `(${compra.usuarioId}, '${compra.tipoCompra}', ${compra.itemId}, ${compra.precoTotal})`
    ).join(", ");
    const instrucaoSql = `
        INSERT INTO compras (usuario_id, tipo_compra, item_id, preco_total)
        VALUES ${valores};
    `;
    return database.executar(instrucaoSql);
}

function listarPacotesLogado(usuarioId) {
    const instrucaoSql = `
        SELECT 
            p.id AS pacote_id, 
            p.titulo, 
            p.categoria, 
            p.preco, 
            COALESCE(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id, 
                        'nome', s.titulo, 
                        'caminho', CONCAT('../ambienteSons/', s.caminho_arquivo)
                    )
                ),
                '[]'
            ) AS sons
        FROM pacotes_sons p
        LEFT JOIN pacote_sons_relacao psr ON p.id = psr.pacote_id
        LEFT JOIN sons s ON s.id = psr.som_id
        WHERE p.id NOT IN (
            SELECT c.item_id
            FROM compras c
            WHERE c.usuario_id = ${usuarioId} AND c.tipo_compra = 'pacote'
        )
        GROUP BY p.id;
    `;
    return database.executar(instrucaoSql);
}


function listarPacotesComprados(usuarioId) {
    const instrucaoSql = 
        `SELECT 
            p.id AS pacote_id, 
            p.titulo, 
            p.categoria, 
            p.preco,
            COALESCE(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id, 
                        'nome', s.titulo, 
                        'caminho', CONCAT('../ambienteSons/', s.caminho_arquivo)
                    )
                ),
                '[]'
            ) AS sons
        FROM pacotes_sons p
        INNER JOIN compras c ON c.item_id = p.id
        LEFT JOIN pacote_sons_relacao psr ON p.id = psr.pacote_id
        LEFT JOIN sons s ON s.id = psr.som_id
        WHERE c.usuario_id = ${usuarioId} AND c.tipo_compra = 'pacote'
        GROUP BY p.id;`;

    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    listar,
    listarLogado,
    registrarCompra,
    registrarComprasEmLote,
    listarSonsComprados,
    listarPacotesComprados,
    listarPacotesComSons,
    listarSonsDoPacote,
    listarPacotesLogado,
    cadastrar
};