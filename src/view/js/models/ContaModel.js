import { config } from '../config/request-config.js';

export default class ContaModel{
    constructor(){
    }

    /**
     * @returns Array(object)
     * [{
     *      id,
     *      nickname
     * }]
     */
    async getInformacoesConta(){
        const res = await fetch(`${config.url}/conta`);
        const infosConta = await res.json();

        return {...infosConta[0]};
    }
}
