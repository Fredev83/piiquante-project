// On importe le modèle Sauce
const Sauce = require('../models/Sauce');
// On inclut le module fs de Node js pour la gestion des fichiers
const fs = require('fs');

// Controleur pour la création d'une sauce
exports.createSauce = (req, res, next) => {
  //on extrait la sauce de la requête via le parse
    const sauceObject = JSON.parse(req.body.sauce);
    //redefinit la propriété _id
    delete sauceObject._id;
    //redéfinit la propriété _userId 
    delete sauceObject._userId;
    // déclaration de sauce qui sera une nouvelle instance du modele Sauce qui contient toutes les informations dont on a besoin
    const sauce = new Sauce({
      //le userId de la requête doit être le même que l'Id associé au token
        ...sauceObject,
        userId: req.auth.userId,
        //image appelée via l' URL, définir le chemin avec le protocole http, l'hôte (localhost:4200/Sauce) et nom du fichier (filename)
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save() //on utilise la méthode save pour enregistrer Sauce dans la base de données, elle renvoie une promise
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'})) // on renvoie une réponse de réussite
        .catch(error => res.status(400).json({ error })); // on renvoie la réponse d'erreur générée automatiquement par Mongoose et un code erreur 400
};

// Controleur pour la modification d'une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
      //on extrait la sauce de la requête via le parse
        ...JSON.parse(req.body.sauce),
        //image appelée via l' URL, définir le chemin avec le protocole http, l'hôte (localhost:4200/Sauce) et nom du fichier (filename)
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    //supprime la propriété _userId de l'objet "sauceObject"
    delete sauceObject._userId;
    //filtre dans la base de données le _id unique avec les paramètres fournis dans l'URL de la requête
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
          //vérifie si l'utilisateur authentifié correspond à l'utilisateur qui a créé la sauce
            if (sauce.userId != req.auth.userId) {
              //message d'erreur interdit si les deux sont différents
                res.status(403).json({ message : 'Requête non autorisée !'});
            } else {
              //si tout est ok alors on modifie la sauce dans la base de données
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                //message si tout est ok
                .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
                //en cas d'erreur un status 401 Non autorisé et l'erreur en json
                .catch(error => res.status(401).json({ error }));
            }
        })
        // en cas d'erreur un status 400 Bad Request et l'erreur en json
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// Controleur pour la suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  //filtre dans la base de données le _id unique avec les paramètres fournis dans l'URL de la requête
    Sauce.findOne({ _id: req.params.id})
       .then(sauce => {
        //vérifie si l'utilisateur authentifié correspond à l'utilisateur qui a créé la sauce
           if (sauce.userId != req.auth.userId) {
            //message d'erreur interdit si les deux sont différents
               res.status(403).json({message: 'Requête non autorisée !'});
           } else {
            // on crée un tableau via l'url et en séparant la partie '/images' et ensuite on recupère l'indice 1 du tableau qui est le nom du fichier
               const filename = sauce.imageUrl.split('/images/')[1];
               // On supprime le fichier image de la sauce
               fs.unlink(`images/${filename}`, () => {
                //supprime le fichier correspondant à l'Id spécifié de la collection "sauce" de la base de donnée MongoDB
                   Sauce.deleteOne({_id: req.params.id})
                   //message si tout est ok
                       .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                        //en cas d'erreur un status 401 Non autorisé et l'erreur en json
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
         // en cas d'erreur un status 500 Erreur interne du serveur et l'erreur en json
           res.status(500).json({ error });
       });
};

// Controleur pour l'affichage d'une sauce
exports.getOneSauce = (req, res, next) =>{
  //filtre dans la base de données le _id unique avec les paramètres fournis dans l'URL de la requête
    Sauce.findOne({ _id: req.params.id })
     //message si tout est ok
        .then(sauce => res.status(200).json(sauce))
        // en cas d'erreur un status 400 Bad Request et l'erreur en json
        .catch(error => res.status(400).json({ error }));
};

// Controleur pour l'affichage de toutes les sauces
exports.getAllSauces = (req, res, next) => {
  // on utilise la méthode find et on renvoie un tableau contenant les Sauces de la BDD
    Sauce.find() 
    //message si tout est ok
        .then(sauces => res.status(200).json(sauces))
        // en cas d'erreur un status 400 Bad Request et l'erreur en json
        .catch(error => res.status(400).json({ error }));
};

// Controleur pour gérer les likes et dislikes
exports.manageLike = (req, res, next) => {
  // On récupère l'userId
  let userId = req.body.userId;
  // On récupère la sauceId
  let sauceId = req.params.id;
  // On récupère le like de la requête du body
  let like = req.body.like;
  
  if (like === 1) {
    // Si l'utilisateur clique sur le pouce Like pour la première fois
    // => on met à jour la sauce ayant cet Id
    Sauce.updateOne(
      { _id: sauceId },
      {
        // [ mongoDB push operator ]
        // On ajoute (on pousse) l'userId au tableau [array] des usersLiked
        $push: { usersLiked: userId },
        // [ mongoDB increment operator ]
        // On incrémente likes avec +1
        $inc: { likes: +1 },
      }
    )
      .then(() => { res.status(200).json({ message: "Like ajouté par l'utilisateur !" })})
      .catch((error) => res.status(400).json({ error }));
  }
  
  if (like === -1) {
    // Si l'utilisateur clique sur le pouce disLike pour la première fois
    // => on met à jour la sauce ayant cet Id
    Sauce.updateOne(
      { _id: sauceId },
      {
        // [ mongoDB push operator ]
        // On ajoute (on pousse) l'userId au tableau [array] des usersDisliked
        $push: { usersDisliked: userId },
        // [ mongoDB increment operator ]
        // On incrémente dislikes
        $inc: { dislikes: +1 },
      }
    )
      .then(() => { res.status(200).json({ message: "Dislike ajouté par l'utilisateur !" })})
      .catch((error) => res.status(400).json({ error }));
  }
  
  // Suppression like ou dislike
  if (like === 0) {
    Sauce.findOne({
      _id: sauceId,
    })
      .then((sauce) => {
        // Suppression like
        // Si l'utilisateur a déjà cliqué sur le pouce like donc si l'userId est inclus dans le tableau des usersLiked
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            // [ mongoDB pull operator ]
            // On supprime l'userId du tableau des usersLiked et on décrémente likes
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then(() => { res.status(200).json({ message: "Like retiré par l'utilisateur !" })})
            .catch((error) => res.status(400).json({ error }));
        }
        // Suppresson dislike
        // Si l'utilisateur a déjà cliqué sur le pouce disLike donc si l'userId est inclus dans le tableau des usersDisliked
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            // [ mongoDB pull operator ]
            // On supprime l'userId du tableau des usersDisliked et on décrémente disLikes
            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
          )
            .then(() => { res.status(200).json({ message: "Dislike retiré par l'utilisateur !" })})
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};