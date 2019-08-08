
const db = require('../connect.js');
require('dotenv').config();

const ID_CONTA = parseInt(process.env.ID_CONTA);

async function updateConta(info) {
    let fieldsQuery = [];

    if(info.ultimo_envio){
        fieldsQuery.push(`ultimo_envio = \"${info.ultimo_envio}\"`)
    }

    if(info.proximo_envio){
        fieldsQuery.push(`proximo_envio = \"${info.proximo_envio}\"`)
    }

    if(info.alteracao_status){
        fieldsQuery.push(`alteracao_status = \"${info.alteracao_status}\"`)
    }
    
    if(info.numero_envios || info.numero_envios === 0){
        fieldsQuery.push(`numero_envios = ${info.numero_envios}`)
    }
    
    if(info.numero_erros || info.numero_erros === 0){
        fieldsQuery.push(`numero_erros = ${info.numero_erros}`)
    }

    fieldsQuery.push(`status = ${info.status}`)
    

    //console.log(fieldsQuery.join(', '))
    const sqlQuery = `UPDATE perguntador_automatico.conta SET ${fieldsQuery.join(', ')} WHERE id_conta = ${ID_CONTA}`
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
        }

        console.log(result);
    })
}


module.exports = {
    updateConta
} 