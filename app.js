//import
const express = require('express');

//instantiation
const app = express();
//pour autoriser de recevoir du json en post
app.use(express.json()); 

//démarrage
app.listen(3000, () => console.log('<<Démarrage>>'));

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
app.get('/articles',(request,response) => {
    response.json(articles);
});

app.get('/article/:id',(request,response) => {
    const id=parseInt(request.params.id);
    const article = articles.find(a => a.id===id); //triple égalité pour une égalité de valeur et type d'où le parseInt
    if (article!=undefined) {
        response.json(article);
    } else {
        response.json({message: 'article introuvable'});
    }
});

app.post('/save-article',(request,response) => {
    const articleJSON = request.body;
    
    //si pas d'id alors on ne va pas plus loin
    if (articleJSON.id==undefined) {
        return response.json({message: 'id introuvable'});
    }

    //sinon par défaut
    let articleFinal = null;
    articleFinal = articles.find(a => a.id===articleJSON.id); //find donne l'adresse mémoire

    if(articleFinal){ //si article final existe alors je maj
        articleFinal.title=articleJSON.title;
        articleFinal.content = articleJSON.content;
        articleFinal.author = articleJSON.author;
        //pas besoin de maj le contenu de la liste car déjà fait (maj par ref)
        return response.json(`L'article id=${articleFinal.id} a été mis à jour avec succès`); //return pour arrêter la fonction
    }

    //sinon par défaut = cas création [méthode guard clauses afin d'éviter les else]
    articleFinal={};
    articleFinal.id = articleJSON.id;
    articleFinal.title=articleJSON.title;
    articleFinal.content = articleJSON.content;
    articleFinal.author = articleJSON.author;
    articles.push(articleFinal);
    return response.json(`L'article id=${articleFinal.id} a été créé avec succès`);

});

app.delete('/article/:id',(request,response) => {
    const id = parseInt(request.params.id);
    const index = articles.findIndex(a => a.id===id); //renvoie -1 si pas trouvé
    if (index<0) {
        return  response.json({message: 'article introuvable'});
    } 
    articles.splice(index,1);
    response.json({message: `article ${id} supprimé avec succès`});
});