const Recette = require('../models/Recette');
const fs = require('fs');

exports.createRecette = (req, res, next) => {
    const recetteObject = JSON.parse(req.body.recette);
    delete recetteObject._id;
    delete recetteObject._userId;
    const recette = new Recette({
        ...recetteObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    recette.save()
    .then(() => { res.status(201).json({message: 'Recette enregistrée !'})})
    .catch(error => { res.status(400).json( { error })})
 };
 exports.modifyRecette = (req, res, next) => {
    const recetteObject = req.file ? {
        ...JSON.parse(req.body.recette),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete recetteObject._userId;
    Recette.findOne({_id: req.params.id})
        .then((recette) => {
            if (recette.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Recette.updateOne({ _id: req.params.id}, { ...recetteObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Recette modifiée!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };
 exports.deleteRecette = (req, res, next) => {
    Recette.findOne({ _id: req.params.id})
        .then(recette => {
            if (recette.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = recette.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Recette.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Recette supprimée !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };
exports.getOneRecette = (req, res, next) => {
    Recette.findOne({ _id: req.params.id })
        .then(recette => res.status(200).json(recette))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllRecettes = (req, res, next) => {
    Recette.find()
      .then(recettes => res.status(200).json(recettes))
      .catch(error => res.status(400).json({ error }));
  
  };