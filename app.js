//import express
const express = require('express');

//instantiation
const app = express();
//pour autoriser de recevoir du json en post
app.use(express.json()); 

//======================BDD=========================//
const initMongoConnection = require('./mongoose/mongoose-config'); //sans extension pour require
initMongoConnection(); //sans préfixe "mongooseConfig." car export sans accolade

//démarrage
app.listen(3000, () => console.log('<<Démarrage serveur node>>'));

// Simulation de données en mémoire avant mise en place de la bdd (bouchon)
/*
let articles = [
    { id: 1, title: 'Premier article', content: 'Contenu du premier article', author: 'Isaac' },
    { id: 2, title: 'Deuxième article', content: 'Contenu du deuxième article', author: 'Sanchez' },
    { id: 3, title: 'Troisième article', content: 'Contenu du troisième article', author: 'Toto' }
];*/
/*
let users = [
    {pseudo: "cyril", password: "azerty"},
    {pseudo: "admin", password: "Pa$$w0rd"}
]*/

//routes
const articleRouter = require('./routes/article-routes');
app.use(articleRouter); //on pourrait faire app.use('/articles',articlerouter pour avoir un prefixe sur les routes)

const authRouter = require('./routes/auth-routes');
app.use(authRouter); 