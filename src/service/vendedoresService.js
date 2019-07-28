const db = require('../connect.js');


async function novoVendedor(vendedor) {
    let novasVend = [];

    for (let vend in vendedor) {
        novasVend.push([vendedor[vend].anuncio, vendedor[vend].user_id, vendedor[vend].nickname]);
    }
    const sqlQuery = `INSERT INTO perguntador_automatico.anuncios (anuncio_id, user_id, nickname) VALUES ?`
    db.query(sqlQuery, [novasVend], (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
        }

        //console.log(result);
    });
}

async function atualizarVendedor(vendedor) {
    let novasVend = [];

    for (let vend in vendedor) {
        novasVend.push([vendedor[vend].anuncio, vendedor[vend].user_id, vendedor[vend].nickname]);
    }
    const sqlQuery = `UPDATE perguntador_automatico.anuncios SET user_id, nickname WHERE anuncio_id =`
    db.query(sqlQuery, [novasVend], (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
        }

        //console.log(result);
    })
}

async function selectVendedores(callback, params) {
    const sqlQuery = `SELECT * FROM perguntador_automatico.anuncios`;
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
            callback(resultArr, params ? params : null)
        }
    })
}

module.exports = {
    novoVendedor,
    selectVendedores
} 