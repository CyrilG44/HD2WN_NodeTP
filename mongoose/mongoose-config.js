//======================BDD=========================//
//import mongoose
const mongoose = require('mongoose');

//fonction unique d'initialisation
function initMongoConnection(){
    //ecouter le succès de connexion
    mongoose.connection.once('open', () => console.log("<<Connecté à la base de données>>"))

    //ecouter l'échec de connexion
    mongoose.connection.on('error', (err) => console.log(`Erreur base de données : ${err}`))

    //Se connecter à mongoDB
    mongoose.connect("mongodb://localhost:27017/db_tp_articles");
}

//EXPORTER LA FONCTION
module.exports = initMongoConnection;