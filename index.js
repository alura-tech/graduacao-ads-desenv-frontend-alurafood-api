const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { uuid } = require("uuidv4");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "application/json" }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    if (req.method === "OPTIONS") {
        res.status(200);
        res.send();
    }
    next();
});

// GET
app.get("/", (req, res) => res.send("Alura.Food API"));
app.get("/api/produtos/:page/:items", (req, res) => {
    let page = parseInt(req.params.page) || 1;
    let items = parseInt(req.params.items) || 6;

    if (page < 0 || items < 0)
    {
        items = 6;
        page = 1;
    }

    const jsonProdutos = fs.readFileSync("./data/produtos.json", "utf-8");
    /** @type {any[]} */
    const produtos = JSON.parse(jsonProdutos);
    let totalPages = Math.ceil(produtos.length / items);
    let from = (page - 1) * items;
    let to = from + items;
    const produtosToReturn = produtos.slice(from, to);
    const returnInfo = {
        totalPages,
        data: produtosToReturn
    }
    res.send(JSON.stringify(returnInfo));
});
app.get("/api/pedidos", (req, res) => {
    const jsonPedidos = fs.readFileSync("./data/pedidos.json", "utf-8");
    res.send(jsonPedidos);
});
app.get("/api/mensagens", (req, res) => {
    const jsonMensagens = fs.readFileSync("./data/mensagens.json", "utf-8");
    res.send(jsonMensagens);
});

// POST
app.post("/api/mensagens", (req, res) => {
    try 
    {
        const dadosMensagem = req.body;
        if (!dadosMensagem) throw new Error("Não foi possível registrar sua mensagem de contato!");
        if (!dadosMensagem.nomeCompleto) throw new Error("Nome é obrigatório!");
        if (!dadosMensagem.email) throw new Error("E-mail inválido!");
        if (!dadosMensagem.assunto) throw new Error("Assunto é obrigatório!");
        if (!dadosMensagem.mensagem) throw new Error("mensagem é obrigatório!");

        const jsonMensagens = fs.readFileSync("./data/mensagens.json", "utf-8");
        const listaMensagens = JSON.parse(jsonMensagens);
        listaMensagens.push(dadosMensagem);
        fs.writeFileSync("./data/mensagens.json", JSON.stringify(listaMensagens, null, 4), "utf-8");
        res.status(200).json({
            status: 1,
            message: "Mensagem registrada com sucesso!"
        });
    }
    catch(e) {
        res.status(500).json({ 
            status: 0, 
            message: e.message 
        });
    }
});
app.post("/api/pedidos", (req, res) => {
    try 
    {
        const dadosPedido = req.body;
        if (!dadosPedido) throw new Error("Não foi possível registrar seu pedido!");
        if (!dadosPedido.nomeCompleto) throw new Error("Nome é obrigatório!");
        if (!dadosPedido.email) throw new Error("E-mail inválido!");
        if (!dadosPedido.cep) throw new Error("CEP inválido!");
        if (!dadosPedido.endereco) throw new Error("Endereço é obrigatório!");
        if (dadosPedido.numero < 0) throw new Error("Número é obrigatório!");
        if (!dadosPedido.cidade) throw new Error("Cidade é obrigatório!");
        if (!dadosPedido.estado) throw new Error("Estado é obrigatório!");
        if (!dadosPedido.itens.length) throw new Error("Pedido informado não possui itens selecionados!");

        dadosPedido.id = uuid();
        const jsonPedidos = fs.readFileSync("./data/pedidos.json", "utf-8");
        const listaPedidos = JSON.parse(jsonPedidos);
        listaPedidos.push(dadosPedido);
        fs.writeFileSync("./data/pedidos.json", JSON.stringify(listaPedidos, null, 4), "utf-8");
        res.status(200).json({
            status: 1,
            message: "Pedido registrado com sucesso!",
            pedidoId: dadosPedido.id
        });
    }
    catch(e) {
        res.status(500).json({ 
            status: 0, 
            message: e.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor da API rodando em http://localhost:${PORT}`);
});