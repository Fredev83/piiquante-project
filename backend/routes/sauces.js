const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const saucesCtrl = require('../controllers/sauces');

router.post('/', auth, multer, saucesCtrl.createRecette);
router.put('/:id', auth, multer, saucesCtrl.modifyRecette);
router.delete('/:id', auth, saucesCtrl.deleteRecette);
router.get('/:id', auth, saucesCtrl.getOneRecette);
router.get('/', auth, saucesCtrl.getAllRecettes);

module.exports = router;