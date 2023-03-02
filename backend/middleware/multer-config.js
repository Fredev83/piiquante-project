// On importe multer
const multer = require('multer');

// On définit le format des images reçues
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// diskStorage() configure le chemin et le nom de fichier pour les fichiers entrants.
const storage = multer.diskStorage({
  // On choisit la destination
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
   // On modifie le nom du fichier
  filename: (req, file, callback) => {
     // On remplace les espaces éventuels par un tiret bas
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    // On ajoute au nom la date pour être sûr d'avoir un nom de fichier unique
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Middleware single() qui enregistre au système de fichiers du serveur à l'aide du storage configuré.
module.exports = multer({storage: storage}).single('image');