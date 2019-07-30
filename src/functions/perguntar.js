const meli = require('../models/MercadoLivreModel.js');
const db = require('../connect.js');
const MAX_PERGUNTAS_POR_HORA = 2;
let contador = 0;
let intervalPerguntar;

async function enviarPergunta(req, res) {

    console.log(req.query);

    if (req.query && req.query.start == 'true') {
        intervalPerguntar = setInterval(inicializarPerguntas, 60000);
        console.log('PERGUNTAR');
    } else if(intervalPerguntar) {
        console.log('LIMPAR INTERVAL: ', intervalPerguntar);

        clearInterval(intervalPerguntar);
    }
 
    console.log('INTERVAL: ', intervalPerguntar);
    res.sendStatus(200);
}

function inicializarPerguntas() {
    selectPerguntadores();
}

function selectPerguntadores() {
    const sqlQuery = `SELECT * FROM perguntador_automatico.perguntadores`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
            return;
        }

        let resultArr = separaInformacoesDoSelect(result);

        selectVendedores({ perguntadores: resultArr });
    });
}

function selectVendedores(objInformacoes) {
    const sqlQuery = `SELECT * FROM perguntador_automatico.anuncios`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
            return;
        }
        let resultArr = separaInformacoesDoSelect(result);
        selectPerguntas({ ...objInformacoes, anuncios: resultArr });
    })
}

function selectPerguntas(objInformacoes) {
    const sqlQuery = `SELECT * FROM perguntador_automatico.perguntas`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', err);
            return;
        }
        let resultArr = separaInformacoesDoSelect(result);
        perguntar({ ...objInformacoes, perguntas: resultArr });
    })
}

async function perguntar(params) {
    if (contador <= MAX_PERGUNTAS_POR_HORA) {
        console.log('PERGUNTAR');
        contador = contador + 1;

        const { perguntadores: perguntador, anuncios: anuncio, perguntas: pergunta } = getPilhaPergunta(params);

        if (!perguntador || !anuncio || !pergunta) {
            perguntar(params);
            return;
        }

        const body = {
            "text": pergunta.pergunta,
            "item_id": anuncio.anuncio_id
        };

        const ml = new meli.MercadoLivre(perguntador.access_token, perguntador.refresh_token);
        const res = await ml.post(`/questions/${anuncio.anuncio_id}`, body);

        inicializarPerguntas();

        return;
    } else {
        console.log('PARAR DE PERGUNTAR', new Date().toLocaleTimeString('pt-BR'));
        contador = 0;
        return;
    }
    //console.log('RESULTADO: ',res);
}

function separaInformacoesDoSelect(result) {
    let resultArr = [];

    for (let res in result) {
        resultArr.push({ ...result[res] });
    }

    return resultArr;
}

function getPilhaPergunta(params) {
    let pilha = {};
    for (param in params) {
        let arrParam = params[param];
        let lengthArrParam = arrParam.length;

        pilha[param] = arrParam[sortear(lengthArrParam)];
    }

    if ((pilha.anuncios && pilha.perguntadores) && (pilha.anuncios.user_id === pilha.perguntadores.id)) {
        getPilhaPergunta(params);
        return;
    }
    return pilha;
}

function sortear(tamanhoSorteio) {
    return Math.floor((Math.random() * tamanhoSorteio));
}

module.exports = enviarPergunta;