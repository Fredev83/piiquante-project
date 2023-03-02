// On importe le package de cryptage pour hacher le mot de passe
const bcrypt = require('bcrypt');
// On importe le package Jsonwebtoken
const jwt = require('jsonwebtoken');
// On importe le modèle Utilisateur
const User = require('../models/User');

// Controleur pour la création d'un compte utilisateur
exports.signup = (req, res, next) => {
    // Première chose que l'on fait, on crypte le mot de passe, il s'agit d'une fonction
    // asynchrone, qui prend donc du temps ; ici on choisit d'effectuer 10 tours d'algorythme
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

// Contrôleur pour la connexion à un compte utilisateur
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};