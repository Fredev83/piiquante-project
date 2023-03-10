//importation du package express
const express = require('express');
//importation du package mongoose
const mongoose = require('mongoose');
//importation de "path" afin de définir les chemins
const path = require('path');


// Sécurités nécessaires
// Express-rate-limit sert à limiter la demande entrante.
const rateLimit = require('express-rate-limit');
// Helmet sécurise les applications Express en définissant divers en-têtes HTTP
const helmet = require('helmet');

// Import des routes
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');


// Configuration de la base de données mongoDB avec des variables d'environnement
 mongoose.connect(process.env.MONGODB_URL,
    { useNewUrlParser: true,
        useUnifiedTopology: true })
        .then(() => console.log('Connexion à MongoDB réussie !'))
        .catch(() => console.log('Connexion à MongoDB échouée !'));
        

// La variable d'application stocke le module express
const app = express();
app.use(express.json());
app.use(helmet({
//Seules les demandes provenant du même site peuvent lire la ressource
crossOriginResourcePolicy: { policy: "same-site" },
})
);

// Création d'un limiteur en appelant la fonction rateLimit avec les options : 
// max contient le nombre maximum de requêtes et windowMs contient le temps en millisecondes,
// de sorte que seule la quantité maximale de requêtes peut être effectuée dans le temps windowMS.
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Trop de requêtes venant de cette adresse IP"
});
// Ajout de la fonction limiteur au middleware express afin que chaque demande provenant de l'utilisateur passe par ce middleware.
app.use(limiter);

// CORS : Ajout des Middlewares d'autorisations
app.use((req, res, next) => {
    //qui peut accéder à l'API
    res.setHeader('Access-Control-Allow-Origin', '*');
    //quels headers sont autorisés
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    //quelles méthodes sont possibles
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


// Routes attendues par le frontend
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

// Middleware de téléchargement de fichiers (ici, images des sauces)
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;



