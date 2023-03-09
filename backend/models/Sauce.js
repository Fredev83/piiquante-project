//importation du package mongoose pour la base de données
const mongoose = require('mongoose');

//définition du schéma pour mongoose sous forme JSON
//en spécifiant d'une string, number, array...
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true},
  name: { type: String, required: true},
  manufacturer: { type: String, required: true},
  description: { type: String, required: true},
  mainPepper: { type: String, required: true},
  imageUrl: { type: String, required: true},
  heat: { type: Number, required: true},
  likes: { type: Number, default: 0},
  dislikes: { type: Number, default: 0},
  usersLiked: { type: [String]},
  usersDisliked: { type: [String]}
    
});

//on exporte le model de sauce (ici dans controllers/sauce.js)
module.exports = mongoose.model('Sauce', sauceSchema);