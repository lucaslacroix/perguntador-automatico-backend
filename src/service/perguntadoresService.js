const db = require('../connect.js');


async function novoPerguntador(perguntador) {
    const novoUsuario = [
        [perguntador.id, perguntador.access_token, perguntador.refresh_token]
    ];
    const sqlQuery = `INSERT INTO perguntador_automatico.perguntadores (id, access_token, refresh_token) VALUES ?`
    db.query(sqlQuery, [novoUsuario], (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err.sqlMessage);
            if (err.code === 'ER_DUP_ENTRY') {
                atualizarPerguntador(perguntador);
            }
        }

        console.log(result);
    });
}
async function atualizarPerguntador(perguntador) {
    const sqlQuery = `UPDATE perguntador_automatico.perguntadores SET access_token = \'${perguntador.access_token}\', refresh_token = \'${perguntador.refresh_token}\' WHERE id = ${perguntador.id}`
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
        }

        console.log(result);
    })
}

async function selectPerguntadores(callback) {
    const sqlQuery = `SELECT * FROM perguntador_automatico.perguntadores`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
            return;
        }
        let resultArr = []
        for (let res in result) {
            resultArr.push({ ...result[res] });
        }
        if (callback) {
            callback(resultArr)
        }
    });
}

module.exports = {
    novoPerguntador,
    atualizarPerguntador,
    selectPerguntadores
} 