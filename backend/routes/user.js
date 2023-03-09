//importation du package express
const express = require('express');
//definition de la fonction express.Router utilisée pour créer un objet routeur pour gérer les requêtes
const router = express.Router();
//Création du chemin "user" dans controllers
const userCtrl = require('../controllers/user');

//Les router signup et login sont en methode "post"
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

//export du router
module.exports = router;