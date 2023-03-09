// on appelle jsonwebtoken pour le middleware d'authentification
const jwt = require('jsonwebtoken');
// on exporte la requete
module.exports = (req, res, next) => {
    //essai
   try {
        // on utilise le header authorization de la requete (CORS) on split le tableau et on récupère l'élément à l'indice 1 (Bearer Token)
       const token = req.headers.authorization.split(' ')[1];
       // On vérifie si la clé d'authentification du token est correcte
       const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);
       // On récupère l'userId du token
       const userId = decodedToken.userId;
       // Et, on vérifie que l'userId est bien celui envoyé par la requête
       req.auth = {
           userId: userId
       };
     // passe au middleware suivant     
	next();
    // si il y a une erreur     
   } catch(error) {
    // reponse status 401 Unauthorized avec un message en json
       res.status(401).json({ error });
   }
};