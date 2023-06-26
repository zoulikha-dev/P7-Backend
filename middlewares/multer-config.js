//configuration Multer pour gérer le téléchargement d'un fichier unique.
const multer = require("multer");

// Définition des types MIME pour les extensions d'images acceptées
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration du stockage des fichiers avec Multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Destination du fichier : le dossier "images"
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    // Génération du nom de fichier unique
    const name = file.originalname.split(" ").join("_"); // Remplacement des espaces par des underscores
    const extension = MIME_TYPES[file.mimetype]; // Récupération de l'extension en fonction du type MIME
    callback(null, name + Date.now() + "." + extension); // Nom du fichier : originalname + timestamp + extension
  },
});

// Export du middleware Multer configuré pour traiter les fichiers uniques avec le stockage défini
module.exports = multer({ storage: storage }).single("image");
