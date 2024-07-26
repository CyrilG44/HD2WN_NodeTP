//imports
const express = require('express');
const router = express.Router(); //création d'une instance equivalente à app
const Article = require('../mongoose/models/mongoose-article');
const helpers = require('../shared/helpers');
const middlewares = require('../shared/middleware');
//import uuid version 4
const {v4: uuidv4} = require('uuid');

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

//on remplace app par router
router.get('/articles',async (request,response) => {
    const allArticles = await Article.find();
    return helpers.responseService(response,'200','La liste des articles a été récupérés avec succès',allArticles);
});

router.get('/article/:id',async (request,response) => {
    const idParam=request.params.id;
    const article = await Article.findOne({uid : idParam});
    if (article) {
        return helpers.responseService(response,'200','Article récupéré avec succès',article);
    }
    return helpers.responseService(response,'702',`Impossible de récupérer un article ayant UID=${idParam}`,null);
});

router.post('/save-article', middlewares.authMiddleware, async (request,response) => {
    const articleJSON = request.body;

    let articleObject = null;
    let articleByTitle = null;
    //controle de surface
    const erreurs = surfaceControl(articleJSON);
    if(erreurs.length>0){
        return helpers.responseService(response,'710',`controle de surface non valide`,erreurs);
    }

    //si id alors on est en édition
    if (articleJSON.uid) {
        articleObject = await Article.findOne({uid : articleJSON.uid});//on essaie de retrouver l'article existant
        //si pas d'article correspondant en bdd
        if(!articleObject){
            return helpers.responseService(response,'702',`Aucun article ayant UID=${articleJSON.uid} n'a été trouvé`,null);
        }
        //sinon par défaut on vérifie l'unicité du titre
        const articleByTitle = await Article.findOne({title : articleJSON.title, uid: { $ne: articleJSON.uid }});//on extrait l'éventuel article en bdd ayant le titre de l'article masi pas le même uid
        if(articleByTitle){
            return helpers.responseService(response,'701',`Impossible de modifier l'article puisqu'un autre article possède déjà ce titre`,null);
        }
        //sinon par défaut on maj
        articleObject.title=articleJSON.title;
        articleObject.content = articleJSON.content;
        articleObject.author = articleJSON.author;
        await articleObject.save(); //maj en bdd
        return helpers.responseService(response,'200','Article mis à jour avec succès',articleObject);//return pour arrêter la fonction
    }
    //sinon par défaut - cas création -> controle unicité titre vs existant
    articleByTitle = await Article.findOne({title : articleJSON.title});//on extrait l'éventuel article en bdd ayant le titre de l'article à creer/éditer
    if(articleByTitle){
        return helpers.responseService(response,'701',`Impossible de créer l'article puisqu'un autre article possède déjà ce titre`,null);
    }

    //sinon par défaut - cas création -> on crée l'article en bdd 
    articleJSON.uid = uuidv4();
    articleObject = await Article.create(articleJSON); //si articleJSON avait d'autres attributs ils ne seraient pas ajoutés en bdd grâce au model Article -> heureusement
    return helpers.responseService(response,'200','Article ajouté avec succès',articleObject);
});

router.delete('/article/:id', middlewares.authMiddleware, async (request,response) => {//si plusieurs middleware alors injecter un tableau de middleware
    //recuperer l'id
    const idParam = request.params.id;
    //voir si l'article existe
    articleObject = await Article.findOne({uid : idParam});
    //s'il n'existe pas alors message
    if(!articleObject){
        return helpers.responseService(response,'702',`Impossible de supprimer article ayant id=${idParam} car introuvable`,null);
    }
    //sinon par défaut
    await articleObject.deleteOne();
    return helpers.responseService(response,'200',`article id=${idParam} supprimé avec succès`,articleObject);

});

//EXPORTER LE router
module.exports = router