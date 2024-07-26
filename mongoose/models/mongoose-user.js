//import mongoose
const mongoose = require('mongoose');

//Déclarer le modèle User
// 1. nom pour les relations dans le code js (pas utilisé pour le moment)
// 2. les attributs attendus pour ce modèle
// 3. le nom de la collection en base liée (synonyme de table en sql)
const User=mongoose.model('User', {
    pseudo: String,
    password: String}, 
    'users');

//EXPORT
module.exports = User;