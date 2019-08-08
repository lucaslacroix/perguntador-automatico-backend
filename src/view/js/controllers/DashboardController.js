import VendedoresModel from '../models/VendedoresModel.js';
import PerguntasModel from '../models/PerguntasModel.js';
import PerguntadoresModel from '../models/PerguntadoresModel.js';
import ContaModel from '../models/ContaModel.js';

export default class DashboardController {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        this.btnAddVendedor = document.querySelector('#btn-adicionar-vendedor');
        this.btnIniciarPerguntador = document.querySelector('#play-perguntar');
        this.btnPararPerguntador = document.querySelector('#stop-perguntar');
        this.vendedores = new VendedoresModel();
        this.perguntadores = new PerguntadoresModel();
        this.perguntas = new PerguntasModel();
        this.conta = new ContaModel();
        this.btnAddVendedor.addEventListener('click', this.adicionarVendedor);
        this.btnIniciarPerguntador.addEventListener('click', this.iniciarPerguntador);
        this.btnPararPerguntador.addEventListener('click', this.pararPerguntador);
        this.setVendedores();
        this.setPerguntas();
        this.setPerguntadores();
        this.setInformacoesConta();
    }

    setVendedores = async () => {
        const listaHTML = document.querySelector('#lista-de-vendedores');
        listaHTML.innerHTML = '';
        const anunciosCadastradosHTML = document.querySelector('#total-anuncios-cadastrados');

        const arrVendedores = await this.vendedores.getVendedores();
        anunciosCadastradosHTML.innerHTML = await this.vendedores.getTotalAnunciosCadastrados();

        this.setListItems(arrVendedores.map(({ nickname, totalAnuncios }) => `<span>${nickname}</span><span class="badge badge-primary">${totalAnuncios}</span>`), listaHTML);
    }

    setPerguntas = async () => {
        const listaHTML = document.querySelector('#lista-de-perguntas');
        listaHTML.innerHTML = '';
        const perguntasCadastradasHTML = document.querySelector('#total-perguntas-cadastradas');

        const arrPerguntas = await this.perguntas.getPerguntas();
        perguntasCadastradasHTML.innerHTML = await this.perguntas.getTotalPerguntasCadastradas();

        this.setListItems(arrPerguntas.map(({ pergunta }) => `<p>${pergunta}</p>`), listaHTML);
    }

    setPerguntadores = async () => {
        const listaHTML = document.querySelector('#lista-de-perguntadores');

        listaHTML.innerHTML = '';
        const arrPerguntadores = await this.perguntadores.getPerguntadores();

        this.setListItems(arrPerguntadores.map(({ nickname, id }) => `<span>${nickname}</span><span>${id}</span>`), listaHTML);
    }

    adicionarVendedor = async () => {
        const listaHTML = document.querySelector('#lista-de-vendedores');
        let nicknameVal = document.querySelector('#input-nickname').value;

        if (!nicknameVal) {
            return;
        }

        const novoVendedor = await this.vendedores.setNovoVendedor(nicknameVal);

        if (!novoVendedor.error && novoVendedor) {
            this.setListItems([`<span>${novoVendedor[0].nickname}</span><span class="badge badge-primary">${novoVendedor.length}</span>`], listaHTML);
        }
    }

    setListItems = (arrStringHTML, objHTML) => {
        for (let i in arrStringHTML) {
            let li = document.createElement('li');
            li.innerHTML = arrStringHTML[i];
            objHTML.appendChild(li);
        }
    }

    converterDataISOParaLocal = (data) => {
        return new Date(data).toLocaleDateString('pt-BR') + ' ' +  new Date(data).toLocaleTimeString('pt-BR')
    }

    setInformacoesConta = async () => {
        const objConta = await this.conta.getInformacoesConta();

        document.querySelector('#value-ultimo-envio').innerHTML = this.converterDataISOParaLocal(objConta.ultimo_envio);
        document.querySelector('#value-proximo-envio').innerHTML = this.converterDataISOParaLocal(objConta.proximo_envio);
        document.querySelector('#numero-erros').innerHTML = objConta.numero_erros;
        document.querySelector('#numero-envios').innerHTML = objConta.numero_envios;

        if(objConta.status === 1) {
            this.btnPararPerguntador.style.display = '';
            this.btnIniciarPerguntador.style.display = 'none';
        } else {
            this.btnPararPerguntador.style.display = 'none';
            this.btnIniciarPerguntador.style.display = '';
        }
    }

    iniciarPerguntador = async () => {
        this.btnPararPerguntador.style.display = '';
        this.btnIniciarPerguntador.style.display = 'none';
    
        let resposta = await this.perguntas.setPerguntar('true');

        console.log(resposta);

        this.inicializar();
    }
    pararPerguntador = async () => {
        this.btnPararPerguntador.style.display = 'none';
        this.btnIniciarPerguntador.style.display = '';
    
        let resposta = await this.perguntas.setPerguntar('false');

        console.log(resposta);
        this.inicializar();
    }
}