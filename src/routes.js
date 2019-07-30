const routes = require('express').Router();
const db = require('./connect.js');
const meli = require('./models/MercadoLivreModel.js');

//const perguntadoresService = require('./service/perguntadoresService.js');
const perguntasService = require('./service/perguntasService');

const enviarPergunta = require('./functions/perguntar.js');
const novoPerguntador = require('./functions/perguntador.js');
const novoVendedor = require('./functions/vendedores');

routes.post('/novo_vendedor', novoVendedor);

routes.post('/perguntas', async (req, res) => {
    //console.log('REQUEST: ', req.body);
    await perguntasService.novasPerguntas(req.body);

    res.status(200).json(req.body);
});

routes.get('/perguntadores', async (req, res) => {

    const sqlQuery = `SELECT * FROM perguntador_automatico.perguntadores`;
    db.query(sqlQuery, async (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', JSON.stringify(err));
            res.sendStatus(500);
        }
        let resultArr = [];

        for(let i in result){
            const ml = new meli.MercadoLivre(result[i].access_token, result[i].refresh_token);
            const user = await ml.get('/users/me');
            const {nickname} = user;
            resultArr.push({ id: result[i].id, nickname })
        }
 
        res.status(200).send(resultArr);
    });
});

routes.get('/totalPerguntasCadastradas', async (req, res) => {

    const sqlQuery = `SELECT COUNT(id) AS totalPerguntas FROM perguntador_automatico.perguntas`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', JSON.stringify(err));
            res.sendStatus(500);
        }
        res.status(200).send({...result[0]});
    });
});

routes.get('/perguntas', async (req, res) => {

    const sqlQuery = `SELECT * FROM perguntador_automatico.perguntas`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', JSON.stringify(err));
            res.sendStatus(500);
        }
        res.status(200).send(result);
    });
});

routes.get('/totalAnunciosCadastrados', async (req, res) => {

    const sqlQuery = `SELECT COUNT(user_id) AS totalAnuncios FROM perguntador_automatico.anuncios`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', JSON.stringify(err));
            res.sendStatus(500);
        }
        res.status(200).send({...result[0]});
    });
});

routes.get('/vendedores', async (req, res) => {

    const sqlQuery = `SELECT COUNT(user_id) AS totalAnuncios, nickname FROM perguntador_automatico.anuncios GROUP BY nickname`;
    db.query(sqlQuery, (err, result, fields) => {
        if (err) {
            console.log('SELECT ERROR: ', JSON.stringify(err));
            res.sendStatus(500);
        }
        res.status(200).send(result);
    });
});

routes.get('/novo_usuario?:code', novoPerguntador);

routes.get('/perguntar?:start', enviarPergunta);

routes.get('/testarRefreshToken', async (req, res) => {
    const ml = new meli.MercadoLivre('APP_USR-3267497931756228-072819-053425369e481d33bd1e6e2f6f9cb2a9-236085503', 'TG-5d3df1331dce6d0006b46525-236085503');

    let result = await ml.refreshAccessToken();

    console.log('RESULTADO: ', result);
});

routes.get('/', async (req, res) => {
    res.sendStatus(200);
});

module.exports = routes;