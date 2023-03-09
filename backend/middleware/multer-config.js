// On importe multer
const multer = require('multer');

// On définit le format des images reçues
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/x-icon": "ico",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/tif": "tif",
  "image/webp": "webp",
};

// on enregistre sur le disque
const storage = multer.diskStorage({
  // On choisit la destination
  destination: (req, file, callback) => {
    // On vérifie qu'il n'y a pas d'erreur (null) 
    //et on indique le nom du dossier de destination (images)
    callback(null, 'images');
  },
  // On definit le nom du fichier
  filename: (req, file, callback) => {
    // On remplace les espaces éventuels par un tiret bas
    const name = file.originalname.split(' ').join('_');
    // permet de créer une extension de fichiers correspondant au mimetype 
    const extension = MIME_TYPES[file.mimetype];
    // On ajoute au nom la date pour être sûr d'avoir un nom de fichier unique
    callback(null, name + Date.now() + '.' + extension);
  }
});

// single() crée un middleware qui capture les fichiers d'un certain type (passé en argument), 
// et les enregistre au système de fichiers du serveur à l'aide du storage configuré.
module.exports = multer({storage: storage}).single('image');