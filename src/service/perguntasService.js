const db = require('../connect.js');


async function novasPerguntas(perguntas) {
    let novasPerg = [];

    for (let perg in perguntas) {
        novasPerg.push([perguntas[perg].pergunta]);
    }
    const sqlQuery = `INSERT INTO perguntador_automatico.perguntas (pergunta) VALUES ?`
    db.query(sqlQuery, [novasPerg], (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
        }

        //console.log(result);
    })
}
async function selectPerguntas(callback, params) {
    const sqlQuery = `SELECT * FROM perguntador_automatico.perguntas`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
            return;
        }
        //console.log(result);
        let resultArr = []
        for (let res in result) {
            resultArr.push({ ...result[res] });
        }
        if (callback) {
            callback(resultArr, params ? params : null);
        }
    })
}

module.exports = {
    novasPerguntas,
    selectPerguntas
} 