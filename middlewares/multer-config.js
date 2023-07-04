//configuration Multer pour gérer le téléchargement d'un fichier unique.
const multer = require("multer");
//configuration Sharp pour gérer l'optimisation de l'image
const sharp = require("sharp");

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
const multerConfig = (module.exports = multer({ storage: storage }).single(
  "image"
));

// Middleware pour l'optimisation de l'image
const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next(); // Si aucun fichier n'est présent, passer au middleware suivant
  }

  try {
    const { path } = req.file; // Chemin du fichier téléchargé
    // Remplacer l'extension du fichier par "_optimized.jpg" pour le chemin de l'image optimisée (format JPEG)
    const optimizedImagePath = path.replace(/\.\w+$/, "_optimized.jpg");

    // Utilisation de Sharp pour optimiser l'image en la convertissant en format JPEG avec une qualité de 80%
    await sharp(path).jpeg({ quality: 80 }).toFile(optimizedImagePath);

    req.file.path = optimizedImagePath; // Mettre à jour le chemin du fichier avec l'image optimisée

    if (optimizedImagePath !== path) {
      // Si le chemin de l'image optimisée est différent du chemin d'origine, supprimer l'ancienne image
      fs.unlink(path, (err) => {
        if (err) {
          console.error(
            "Erreur lors de la suppression de l'image d'origine :",
            err
          );
        }
      });
    }
  } catch (err) {
    console.error("Erreur lors de l'optimisation de l'image :", err);
  }

  next(); // Passe au middleware suivant
};

// Middleware pour supprimer l'ancienne image lors de la mise à jour
const deleteOldImage = async (req, res, next) => {
  if (req.file) {
    // Si une nouvelle image a été téléchargée
    const bookId = req.params.id; // Identifiant du livre à mettre à jour

    try {
      const book = await Book.findById(bookId); // Récupère le livre à mettre à jour

      if (book && book.imageUrl) {
        // Si le livre existe et a une ancienne image
        const oldImagePath = book.imageUrl; // Récupère le chemin de l'ancienne image

        // Supprime l'ancienne image
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error(
              "Erreur lors de la suppression de l'ancienne image :",
              err
            );
          }
        });
      }
    } catch (err) {
      console.error("Erreur lors de la recherche du livre :", err);
    }
  }

  next(); // Passe au middleware suivant
};

module.exports = { multerConfig, optimizeImage, deleteOldImage };
