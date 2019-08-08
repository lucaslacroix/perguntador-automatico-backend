const meli = require('../models/MercadoLivreModel.js');
const db = require('../connect.js');
const contaService = require('../service/contaService.js');

const MAX_PERGUNTAS_POR_HORA = 10;
let contador = 0;
let contadorSucessos = 0;
let contadorErros = 0;
let horaStatusModificado;
let status;
let ultimoEnvio;
let proximoEnvio;
let intervalPerguntar;

function incrementaHorasNaData(horas){
    let data = new Date();
    data.setHours(data.getHours() + 1);
    return data = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR')
}

async function enviarPergunta(req, res) {

    //log.Debug(req.query);

    if (req.query && req.query.start == 'true') {
        intervalPerguntar = setInterval(inicializarPerguntas, 3600000);
        console.log('INICIAR');

        horaStatusModificado = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');

        proximoEnvio = incrementaHorasNaData(1);

        contaService.updateConta({
            proximo_envio: proximoEnvio,
            alteracao_status: horaStatusModificado,
            status: 1,
        })

        res.status(200).json({ "horaInicio": horaStatusModificado, "proximoEnvio": proximoEnvio, "status": "ATIVO" });
    } else if(intervalPerguntar) {

        console.log('PARAR');

        horaStatusModificado = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');

        contaService.updateConta({
            alteracao_status: horaStatusModificado,
            status: 0,
        })
        res.status(200).json({ "horaFim":new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')});

        clearInterval(intervalPerguntar);
    }
 
    //console.log('INTERVAL: ', intervalPerguntar);
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
        contador = contador + 1;
        
        const { perguntadores: perguntador, anuncios: anuncio, perguntas: pergunta } = getPilhaPergunta(params);
        
        if (!perguntador || !anuncio || !pergunta) {
            perguntar(params);
            return;
        }

        console.info('PERGUNTAR PARA: ', JSON.stringify({perguntador, anuncio, pergunta}));
        
        const body = {
            "text": pergunta.pergunta,
            "item_id": anuncio.anuncio_id
        };

        const ml = new meli.MercadoLivre(perguntador.access_token, perguntador.refresh_token);
        const res = await ml.post(`/questions/${anuncio.anuncio_id}`, body);
        console.log('RESULTADO: ', JSON.stringify(res));
        if(res && res.error){
            contador = contador - 1;

            contadorErros = contadorErros + 1;

            console.log('ERRO!');
        } else {

            console.log('PERGUNTOU!');
            
            contadorSucessos = contadorSucessos + 1;
        }

        
        ultimoEnvio = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');

        perguntar(params);

        return;
    } else {
        console.log('PARAR DE PERGUNTAR', new Date().toLocaleTimeString('pt-BR'));
        contador = 0;

        proximoEnvio = incrementaHorasNaData(1);
        
        contaService.updateConta({
            ultimo_envio: ultimoEnvio,
            proximo_envio: proximoEnvio,
            numero_envios: contadorSucessos,
            numero_erros: contadorErros,
            status: 1,
        })

        return;
    }
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