//imports
const express = require('express');
const router = express.Router(); //création d'une instance equivalente à app
const helpers = require('../shared/helpers');
const User = require('../mongoose/models/mongoose-user');

//======================TOKEN=========================//
//import jwt
const jwt = require('jsonwebtoken');
//clé secrète pour les token générés par l'application
const JWT_SECRET = "TP_ENI";
//==================================================//

//on remplace app par router
router.post('/auth', async (request,response) => {
    const userJSON = request.body;
    const loggedUser = await User.findOne({pseudo:userJSON.pseudo, password:userJSON.password});//normalement il faut encrypter le mot de passe dans le serveur

    //if user is not registered in db
    if(!loggedUser){
        return helpers.responseService(response,'404',`${userJSON.pseudo} ou ${userJSON.password} non valide(s)`,null); 
    };

    //else by default create a token
    const token = jwt.sign({pseudo:loggedUser.pseudo}, JWT_SECRET,{expiresIn:'3h'});
    return helpers.responseService(response,'202',"Authentifié(e) avec succès",token);

});

//EXPORTER LE router
module.exports = router