//configuration Multer pour gérer le téléchargement d'un fichier unique.
const multer = require("multer");
//configuration Sharp pour gérer l'optimisation de l'image
const sharp = require("sharp");
// Importe le module 'fs' pour effectuer des opérations de lecture, écriture et suppression de fichiers
const fs = require("fs");

const Book = require("../models/Book");

// Définition des types MIME pour les extensions d'images acceptées
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration du stockage des fichiers avec Multer
//l'objet storage spécifie la destination des fichiers et le nom du fichier
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Destination du fichier : le dossier "images"
    callback(null, "images");
  },
  // la fonction filename génère un nom de fichier unique en utilisant le nom original du fichier, un horodatage et l'extension du fichier.
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_"); // Remplacement des espaces par des underscores
    const extension = MIME_TYPES[file.mimetype]; // Récupération de l'extension en fonction du type MIME
    callback(null, name + Date.now() + "." + extension); // Nom du fichier : originalname + timestamp + extension
  },
});

// Middleware Multer pour traiter les fichiers uniques avec le stockage défini
const multerConfig = multer({ storage: storage }).single("image");

// Middleware pour l'optimisation de l'image
const optimizeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      // Si aucun fichier n'est présent, passer au middleware suivant
      return next();
    }

    const imagePath = req.file.path; // Chemin de l'image d'origine

    const optimizedImagePath = imagePath + ".webp"; // Chemin de la nouvelle image optimisée

    // Optimisation de l'image et conversion en WebP avec Sharp
    await sharp(imagePath)
      .resize(400)
      .webp({ quality: 80 })
      .toFile(imagePath + ".webp");

    //Suppression de l'ancienne image JPEG
    fs.unlinkSync(imagePath);

    req.body.imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/${optimizedImagePath}`;
    // Met à jour l'URL de l'image dans le corps de la requête avec le protocole, l'hôte et le chemin de la nouvelle image optimisée

    // console.log("Nouvelle image optimisée :", req.body.image);
    // console.log("Image optimisée avec succès !"); // Ajout du message de succès

    next();
  } catch (error) {
    // console.log("Erreur lors de l'optimisation de l'image :", error);
    next(error);
  }
};

module.exports = { multerConfig, optimizeImage };
