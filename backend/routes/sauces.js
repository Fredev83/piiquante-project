const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const saucesCtrl = require('../controllers/sauces');

// Requête POST
router.post('/', auth, multer, saucesCtrl.createSauce);
//modification d'une sauce exitante
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
//Suppression d'une sauce existante
router.delete('/:id', auth, saucesCtrl.deleteSauce);
//afficher une sauce spécifique
router.get('/:id', auth, saucesCtrl.getOneSauce);
//afficher toutes les sauces
router.get('/', auth, saucesCtrl.getAllSauces);

// Requête POST pour likes & dislikes
router.post("/:id/like", auth, saucesCtrl.manageLike);


// On exporte les routers
module.exports = router;