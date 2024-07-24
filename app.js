//import express
const express = require('express');
//import uuid version 4
const {v4: uuidv4} = require('uuid');

//instantiation
const app = express();
//pour autoriser de recevoir du json en post
app.use(express.json()); 

//======================BDD=========================//
//import mongoose
const mongoose = require('mongoose');

//ecouter le succès de connexion
mongoose.connection.once('open', () => console.log("<<Connecté à la base de données>>"))

//ecouter l'échec de connexion
mongoose.connection.on('error', (err) => console.log(`Erreur base de données : ${err}`))

//Se connecter à mongoDB
mongoose.connect("mongodb://localhost:27017/db_tp_articles");

//Déclarer le modèle Person
// 1. nom pour les relations dans le code js (pas utilisé pour le moment)
// 2. les attributs attendus pour ce modèle
// 3. le nom de la collection en base liée (synonyme de table en sql)
const Article=mongoose.model('Article', {uid: String, title: String, content: String, author: String}, 'articles') 

//================================================//

//démarrage
app.listen(3000, () => console.log('<<Démarrage serveur node>>'));

// Simulation de données en mémoire
let articles = [
    { id: 1, title: 'Premier article', content: 'Contenu du premier article', author: 'Isaac' },
    { id: 2, title: 'Deuxième article', content: 'Contenu du deuxième article', author: 'Sanchez' },
    { id: 3, title: 'Troisième article', content: 'Contenu du troisième article', author: 'Toto' }
];

//routes
/* si on veut externaliser la partie controller
const routes = require('./routes'); //sans extension
routes.run(app);
*/ /* sinon + simplement */
app.get('/articles',async (request,response) => {
    const allArticles = await Article.find();
    response.json(allArticles);
});

app.get('/article/:id',async (request,response) => {
    const idParam=request.params.id;
    const article = await Article.findOne({uid : idParam});
    if (article) {
        return response.json(article);
    }
    return response.json({message: 'article introuvable'});
});

app.post('/save-article',async (request,response) => {
    const articleJSON = request.body;

    let articleObject = null;

    //si id alors on est en édition
    if (articleJSON.uid) {
        articleObject = await Article.findOne({uid : articleJSON.uid});//on essaie de retrouver l'article existant
        //si pas d'article correspondant en bdd
        if(!articleObject){
            return response.json({message: `article(uid=${articleJSON.uid} introuvable`});
        }
        ///sinon par défaut
        articleObject.title=articleJSON.title;
        articleObject.content = articleJSON.content;
        articleObject.author = articleJSON.author;
        await articleObject.save(); //maj en bdd
        return response.json(`L'article id=${articleObject.uid} a été mis à jour avec succès`); //return pour arrêter la fonction
    }

    //sinon par défaut = cas création 
    articleJSON.uid = uuidv4();
    articleObject = await Article.create(articleJSON); //si articleJSON avait d'autres attributs ils ne seraient pas ajoutés en bdd grâce au model Article -> heureusement
    return response.json(`L'article id=${articleObject.uid} a été créé avec succès`);

});

app.delete('/article/:id', async (request,response) => {
    //recuperer l'id
    const idParam = request.params.id;
    //voir si l'article existe
    articleObject = await Article.findOne({uid : idParam});
    //s'il n'existe pas alors message
    if(!articleObject){
        return  response.json({message: `article id=${idParam} introuvable`});
    }
    //sinon par défaut
    await articleObject.deleteOne();
    return response.json({message: `article id=${idParam} supprimé avec succès`});

});