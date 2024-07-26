//import mongoose
const mongoose = require('mongoose');

//Déclarer le modèle Article
// 1. nom pour les relations dans le code js (pas utilisé pour le moment)
// 2. les attributs attendus pour ce modèle
// 3. le nom de la collection en base liée (synonyme de table en sql)
const Article=mongoose.model('Article', {
    uid: String, 
    title: String, 
    content: String, 
    author: String}, 
    'articles');

//EXPORT
module.exports = Article;