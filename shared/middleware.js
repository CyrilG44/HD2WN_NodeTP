//import
const jwt = require('jsonwebtoken'); 

//clé secrète pour les token générés par l'application
const JWT_SECRET = "TP_ENI";

module.exports = {

    // Middleware = fonction qui fera mur devant la route
    authMiddleware: function(request,response,next){ //next signifie qu'on peut passer à la suite
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

}