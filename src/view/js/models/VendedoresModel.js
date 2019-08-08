import { config } from '../config/request-config.js';

export default class VendedoresModel{
    constructor(){
    }

    async setNovoVendedor(nickname){
        const res = await fetch(`${config.url}/novo_vendedor`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ "nickname": nickname })
        });

        const result = res.json();

        return result;
    }

    /**
     * @returns Array(object)
     * [{
     *      nickname,
     *      totalAnuncios
     * }]
     */
    async getVendedores(){
        const res = await fetch(`${config.url}/vendedores`);
        const vendedores = await res.json();

        return [...vendedores];
    }

    /**
     * @returns (number)
     */
    async getTotalAnunciosCadastrados(){
        const res = await fetch(`${config.url}/totalAnunciosCadastrados`);
        const anunciosCadastrados = await res.json();

        return anunciosCadastrados.totalAnuncios;
    }



}