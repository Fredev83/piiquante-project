//importation du package express
const express = require('express');
//definition de la fonction express.Router utilisée pour créer un objet routeur pour gérer les requêtes
const router = express.Router();
//définition du chemin authentification pour le routeur
const auth = require('../middleware/auth');
//définition du chemin multer pour le routeur
const multer = require('../middleware/multer-config');
//définition du chemin sauce pour le routeur
const sauceCtrl = require('../controllers/sauce');

// Requête POST
router.post('/', auth, multer, sauceCtrl.createSauce);
// Requête PUT | Mise à jour / modification d'une sauce exitante
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
// Requête DELETE | Suppression d'une sauce existante
router.delete('/:id', auth, sauceCtrl.deleteSauce);
// Requête GET pour afficher une sauce spécifique
router.get('/:id', auth, sauceCtrl.getOneSauce);
// Requête GET pour afficher toutes les sauces
router.get('/', auth, sauceCtrl.getAllSauces);

// Requête POST pour likes & dislikes
router.post("/:id/like", auth, sauceCtrl.manageLike);

// On exporte les routers
module.exports = router;