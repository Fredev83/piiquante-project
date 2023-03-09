// On importe le package de cryptage pour hacher le mot de passe
const bcrypt = require('bcrypt');
// On importe le package Jsonwebtoken
const jwt = require('jsonwebtoken');
// Dotenv sert à importer un fichier de variables d'environnement.
const dotenv = require("dotenv").config();
const mailValidator = require("email-validator");
const passwordValidator = require("password-validator");
// On importe le modèle Utilisateur
const User = require('../models/user');

// Création d'un schéma
const schema = new passwordValidator();

// On ajoute les propriétés au schéma
schema
.is().min(8)                                    // Minimum 8 caractères
.is().max(20)                                   // Maximum 20 caractères
.has().uppercase()                              // Doit contenir des lettres majuscules
.has().lowercase()                              // Doit contenir des lettres minuscules
.has().digits(2)                                // Doit avoir au moins 2 chiffres
.has().not().spaces();                          // Ne doit pas contenir d'espace


// Controleur pour la création d'un compte utilisateur
// enregistrement de nouveaux utilisateurs grace a signup
exports.signup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    //vérification si un des deux champs manquant => message
    if (!email || !password){
        return res.status(400).send({
            message: "E-mail ou mot de passe manquant."
        })
    }
    //verification par mail-validator de la structure du mail
        if (!mailValidator.validate(email)) {
        return res.status(400).send({
            message: "L'adresse mail n'est pas valide !"
        })
        //verification de la structure du mot de passe par password-validator
    }    else if (!schema.validate(password)) {
        return res.status(400).send({
            message: "Le mot de passe n'est pas valide ! Il doit contenir au moins 8 caractères, au  moins 2 chiffres, des majuscules et des minuscules et ne doit pas contenir d'espace."
        })
    } else {
        // Première chose que l'on fait, on crypte le mot de passe, il s'agit d'une fonction
        // asynchrone, qui prend donc du temps ; ici on choisit d'effectuer 10 tours d'algorythme
        return bcrypt.hash(password, 10)
            .then(hash => {
                // on cré un nouveau user
                const user = new User({
                    email: email,
                    password: hash,
                });
                // et on le sauvegarde dans la base de données
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }))
    };
};


// Contrôleur pour la connexion à un compte utilisateur
exports.login = (req, res, next) => {
     // on trouve l'adresse email qui est rentrée par un utilisateur (requete)
    User.findOne({ email: req.body.email })
    // pour un utilisateur
        .then(user => {
            // si la requete email ne correspond pas à un utisateur
            if (!user) {
                // status 401 Unauthorized et message en json
                return res.status(401).json({ message: 'Utilisateur non trouvé !' });
            }
             // si c'est ok bcrypt compare le mot de passe de user avec celui rentré par l'utilisateur dans sa requete
            bcrypt.compare(req.body.password, user.password)
                // à la validation
                .then(valid => {
                    // si ce n'est pas valide
                    if (!valid) {
                        // retourne un status 401 Unauthorized et un message en json
                        return res.status(401).json({ message: 'Mot de passe incorrect !' });
                    }
                    // si c'est ok status 200 et renvoi un objet json
                    res.status(200).json({
                        // renvoi l'user id
                        userId: user._id,
                        // renvoi un token traité/encodé
                        token: jwt.sign(
                            // le token aura le user id identique à la requete d'authentification
                            { userId: user._id },
                            // clef secrette pour l'encodage
                            process.env.RANDOM_TOKEN_SECRET,
                            // durée de vie du token
                            { expiresIn: '24h' }
                        )
                    });
                })
                // erreur status 500 Internal Server Error et message en json
                .catch(error => res.status(500).json({ error }));
        })
        // erreur status 500 Internal Server Error et message en json
        .catch(error => res.status(500).json({ error }));
};