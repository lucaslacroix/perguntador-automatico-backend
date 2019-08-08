import { config } from '../config/request-config.js';

export default class PerguntasModel{
    constructor(){
    }

    /**
     * @returns Array(object)
     * [{
     *      id,
     *      nickname
     * }]
     */
    async getPerguntadores(){
        const res = await fetch(`${config.url}/perguntadores`);
        const perguntadores = await res.json();

        return [...perguntadores];
    }

}