exports.run = function(app){
    app.get('/articles',(request,response) => {
        response.json({message: 'retournera tous les articles'});
    });

    app.get('/article/:id',(request,response) => {
        response.json({message: `retournera le détail de l'article id=${request.params.id}`});
    });

    app.post('/save-article',(request,response) => {
        response.json({message: 'créera ou mettra à jour l\'article fourni'});
    });

    app.delete('/article/:id',(request,response) => {
        response.json({message: `supprimera l'article ${request.params.id}`});
    });
}