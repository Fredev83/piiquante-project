const jwt = require('jsonwebtoken');
// Création du middleware d'authentification
module.exports = (req, res, next) => {
   try {
        // On récupère le token de la requête
       const token = req.headers.authorization.split(' ')[1];
       // On vérifie si la clé d'authentification du token est correcte
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       // On récupère l'userId du token
       const userId = decodedToken.userId;
       // Et, on vérifie que l'userId est bien celui envoyé par la requête
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};