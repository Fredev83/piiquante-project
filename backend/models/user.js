//importation du package mongoose
const mongoose = require('mongoose');
//importation du package mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');

//Définition du schéma pour mongoose sous forme JSON
const userSchema = mongoose.Schema({
    //intégration de la validation unique pour l'email (unique: true)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

//application du plugin au schéma
userSchema.plugin(uniqueValidator);

//on exporte le model user (ici dans controllers/user.js)
module.exports = mongoose.model('user', userSchema);