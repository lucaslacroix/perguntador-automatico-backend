const meli = require('../models/MercadoLivreModel.js');

const perguntadoresService = require('../service/perguntadoresService.js');

async function novoPerguntador (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    const code = req && req.query.code ? req.query.code : null;
    const ml = new meli.MercadoLivre();
    //console.log('Code: ', code);
    if (!code) {
        const redirectUrl = ml.getAuthURL();
        res.redirect(redirectUrl);
        //console.log(redirectUrl);
    } else {
        try {
            const auth = await ml.authorize(code);

            //console.log('Autorizado, ', auth);

            perguntadoresService.novoPerguntador({
                id: auth.user_id,
                access_token: auth.access_token,
                refresh_token: auth.refresh_token
            });

            res.sendStatus(200);
        } catch (err) {
            console.log('Erro!', err);
            res.sendStatus(500);
        }
    }
    //console.log('Response: ', req.query);
}


module.exports = novoPerguntador;