const express = require("express")
const server = express()

// Pegar o bando de dados
const db = require("./database/db")

// Configurar pasta pública
server.use(express.static("public"))

// habilitar o req.body
server.use(express.urlencoded({
    extended: true
}))

// Utilizando o template Engine
const nunjuck = require("nunjucks")
nunjuck.configure("src/views", {
    express: server,
    noCache: true
})


// Configurar caminhos da aplicação

// Página inicial

// req -> Requisição
// res -> Resposta

server.get("/", (req, res) => {
    return res.render("index.html", { title: "Um título" })
})

server.get("/create-point", (req, res) => {
    //req.query -> Query strings da URL
    // console.log(req.query)


    return res.render("create-point.html")
})

server.post("/savepoint", (req,res) => {
    // req.body -> Corpo do form
    // console.log(req.body)


    // Inserir dados no BD
    const query = `
        INSERT INTO places (image, name, address, address2, state, city, items) VALUES (
            ?,?,?,?,?,?,?
        );
    `


    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return res.send("Erro no cadastro")
        }

        console.log("Cadastrado com sucesso!")
        console.log(this)
    }

    db.run(query, values, afterInsertData)

    return res.render("create-point.html", { saved: true })
})

server.get("/search", (req, res) => {

    const search = req.query.search

    if(search == "" ) {
        // Pesquisa vazia

        // Mostrar o HTML com os dados do DB
        return res.render("search-results.html", { total: 0 })
    }



    //Pegar os dados do db
    db.all(`SELECT * FROM places WHERE city Like '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }

        const total = rows.length

        return res.render("search-results.html", { places: rows, total: total })
    })    
})

// Ligar o servidor
server.listen(3000)