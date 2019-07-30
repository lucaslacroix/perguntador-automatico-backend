require('es6-promise').polyfill();
require('isomorphic-fetch');

const vendedoresService = require('../service/vendedoresService');

async function novoVendedor (req, res) {
    try {
        let getAnunciosUrl = `https://api.mercadolibre.com/sites/MLB/search?nickname=${req.body.nickname}`;
        let request = await fetch(getAnunciosUrl);
        let requestAnuncios = await request.json();
        //console.log(requestAnuncios);
        if(requestAnuncios.results && requestAnuncios.results.length <= 0){
            throw {message: 'Este usuário não existe ou possui anúncios!'};
        } else if(requestAnuncios.error) {
            throw requestAnuncios.error;
        }
        const nickname = req.body.nickname;
        const user_id = requestAnuncios.seller.id;
        let anuncios = [];

        for (let anuncio in requestAnuncios.results) {
            anuncios.push({ anuncio: requestAnuncios.results[anuncio].id, user_id, nickname })
        }

        //await vendedoresService.novoVendedor(anuncios);

        res.status(200).json(anuncios);
    } catch (err) {
        console.log("Erro no request: ", err);
        res.status(404).json(err);
    }
}



module.exports = novoVendedor;