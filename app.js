//import express
const express = require('express');

//======================TOKEN=========================//
//import jwt
const jwt = require('jsonwebtoken');
//clé secrète pour les token générés par l'application
const JWT_SECRET = "TP_ENI";
//==================================================//

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
const User=mongoose.model('User', {pseudo: String,password: String}, 'users');
//================================================//

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

//reponse json au format
function responseService(response,code,message,data){
    response.json({code: code,message: message, data: data});
}

//controle de surface
function surfaceControl(article){
    let errors = new Array();
    if(!article.title){
        errors.push("titre manquant");
    }
    if(!article.content){
        errors.push("content manquant");
    }
    if(!article.author){
        errors.push("author manquant");
    }
    return errors;
}

// Middleware = fonction qui fera mur devant la route
function authMiddleware(request,response,next){ //next signifie qu'on peut passer à la suite
    //si token null ou erreur
    if(request.headers.authorization == undefined || !request.headers.authorization){
        return response.json({message: 'token null'});
    }
    // Extraire le token (qui est bearer)
    const token = request.headers.authorization.substring(7);
    // par defaut le result est null
    let result = null;
    // Si reussi à générer le token sans crash
    try {
        result = jwt.verify(token, JWT_SECRET);
    } catch {
    }
    // Si result null donc token incorrect
    if (!result) {
        return response.json({ message: "token incorrect"});
    }
    // On passe le middleware
    return next();
}

//routes
/* si on veut externaliser la partie controller
const routes = require('./routes'); //sans extension
routes.run(app);
*/ /* sinon + simplement */
app.get('/articles',async (request,response) => {
    const allArticles = await Article.find();
    return responseService(response,'200','La liste des articles a été récupérés avec succès',allArticles);
});

app.get('/article/:id',async (request,response) => {
    const idParam=request.params.id;
    const article = await Article.findOne({uid : idParam});
    if (article) {
        return responseService(response,'200','Article récupéré avec succès',article);
    }
    return responseService(response,'702',`Impossible de récupérer un article ayant UID=${idParam}`,null);
});

app.post('/save-article', authMiddleware, async (request,response) => {
    const articleJSON = request.body;

    let articleObject = null;
    let articleByTitle = null;
    //controle de surface
    const erreurs = surfaceControl(articleJSON);
    if(erreurs.length>0){
        return responseService(response,'710',`controle de surface non valide`,erreurs);
    }

    //si id alors on est en édition
    if (articleJSON.uid) {
        articleObject = await Article.findOne({uid : articleJSON.uid});//on essaie de retrouver l'article existant
        //si pas d'article correspondant en bdd
        if(!articleObject){
            return responseService(response,'702',`Aucun article ayant UID=${articleJSON.uid} n'a été trouvé`,null);
        }
        //sinon par défaut on vérifie l'unicité du titre
        const articleByTitle = await Article.findOne({title : articleJSON.title, uid: { $ne: articleJSON.uid }});//on extrait l'éventuel article en bdd ayant le titre de l'article masi pas le même uid
        if(articleByTitle){
            return responseService(response,'701',`Impossible de modifier l'article puisqu'un autre article possède déjà ce titre`,null);
        }
        //sinon par défaut on maj
        articleObject.title=articleJSON.title;
        articleObject.content = articleJSON.content;
        articleObject.author = articleJSON.author;
        await articleObject.save(); //maj en bdd
        return responseService(response,'200','Article mis à jour avec succès',articleObject);//return pour arrêter la fonction
    }
    //sinon par défaut - cas création -> controle unicité titre vs existant
    articleByTitle = await Article.findOne({title : articleJSON.title});//on extrait l'éventuel article en bdd ayant le titre de l'article à creer/éditer
    if(articleByTitle){
        return responseService(response,'701',`Impossible de créer l'article puisqu'un autre article possède déjà ce titre`,null);
    }

    //sinon par défaut - cas création -> on crée l'article en bdd 
    articleJSON.uid = uuidv4();
    articleObject = await Article.create(articleJSON); //si articleJSON avait d'autres attributs ils ne seraient pas ajoutés en bdd grâce au model Article -> heureusement
    return responseService(response,'200','Article ajouté avec succès',articleObject);
});

app.delete('/article/:id', authMiddleware, async (request,response) => {//si plusieurs middleware alors injecter un tableau de middleware
    //recuperer l'id
    const idParam = request.params.id;
    //voir si l'article existe
    articleObject = await Article.findOne({uid : idParam});
    //s'il n'existe pas alors message
    if(!articleObject){
        return responseService(response,'702',`Impossible de supprimer article ayant id=${idParam} car introuvable`,null);
    }
    //sinon par défaut
    await articleObject.deleteOne();
    return responseService(response,'200',`article id=${idParam} supprimé avec succès`,articleObject);

});

app.post('/auth', async (request,response) => {
    const userJSON = request.body;
    const loggedUser = await User.findOne({pseudo:userJSON.pseudo, password:userJSON.password});//normalement il faut encrypter le mot de passe dans le serveur

    //if user is not registered in db
    if(!loggedUser){
        return responseService(response,'404',`${userJSON.pseudo} ou ${userJSON.password} non valide(s)`,null); 
    };

    //else by default create a token
    const token = jwt.sign({pseudo:loggedUser.pseudo}, JWT_SECRET,{expiresIn:'3h'});
    return responseService(response,'202',"Authentifié(e) avec succès",token);

});