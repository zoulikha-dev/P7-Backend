const Book = require("../models/Book");
const fs = require("fs"); //Le package fs expose des méthodes pour interagir avec le système de fichiers du serveur.

// Récupère tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books)) // Répond avec les livres trouvés
    .catch((error) => res.status(500).json({ error })); // Gère les erreurs
};

// Récupère un livre par son ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book)) // Répond avec le livre trouvé
    .catch((error) => res.status(404).json({ error })); // Gère les erreurs
};

// Crée un nouveau livre
exports.createBook = (req, res, next) => {
  // Extraction des données du livre à partir du corps de la requête
  const bookObject = JSON.parse(req.body.book);
  // Suppression des propriétés inutiles du livre
  delete bookObject._id;
  delete bookObject._userId;

  const imageUrl = req.body.imageUrl; // Récupère le chemin de l'image optimisée

  // Création d'une nouvelle instance de Book avec les données du livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: imageUrl, // Mettre à jour avec le chemin de l'image optimisée
  });

  book
    .save() // Enregistre le livre dans la base de données
    .then(() => res.status(201).json({ message: "Livre enregistré !" })) // Répond avec un message de succès
    .catch((error) => res.status(400).json({ error })); // Gère les erreurs
};

// Met à jour un livre existant
exports.modifyBook = (req, res, next) => {
  //creation d'un objet bookObject qui regarde si req.file existe ou non ?
  const bookObject = req.file
    ? {
        //Si req.file existe, un nouvel objet bookObject est créé en combinant les données du livre provenant du corps de la requête (JSON.parse(req.body.book)) avec l'URL de l'image générée dynamiquement, qui inclut le protocole, l'hôte et le nom de fichier de l'image téléchargée.
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }.webp`, // Mettre à jour le champ imageUrl avec le nouveau chemin de l'image optimisée au format WebP
      }
    : //s'il n'existe pas, on traite simplement l'objet entrant.
      { ...req.body };
  delete bookObject._userId; //suppression de la propriété pour des raisons de sécurité
  // Recherche le livre dans la base de données en fonction de son identifiant
  Book.findOne({ _id: req.params.id })
    .then((thing) => {
      // Vérifie si l'utilisateur qui effectue la modification est l'auteur du livre
      if (thing.userId != req.auth.userId) {
        //sinon renvoie une réponse 401
        res.status(401).json({ message: "Non autorisé" });
      } else {
        //Si oui, met à jour le livre dans la base de données en utilisant la méthode updateOne()
        // Fournit les nouvelles données du livre en utilisant l'objet bookObject et l'identifiant du livre
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id, imageUrl: bookObject.imageUrl }
        )
          .then(() => {
            const updatedBook = { ...bookObject, _id: req.params.id };
            res
              .status(200)
              .json({ message: "Livre modifié !", book: updatedBook });
          })
          .catch((error) => res.status(400).json({ error })); // Gère les erreurs
      }
    })
    .catch((error) => {
      // Gère les erreurs lors de la recherche du livre dans la base de données
      res.status(400).json({ error });
    });
};

// Supprime un livre
exports.deleteBook = (req, res, next) => {
  // Recherche du livre correspondant à l'ID fourni dans les paramètres de la requête
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        // Vérification si l'utilisateur est autorisé à supprimer le livre
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Extraction du nom de fichier à partir de l'URL de l'image du livre
        const filename = book.imageUrl.split("/images/")[1];
        // Suppression du fichier d'image associé
        fs.unlink(`images/${filename}`, () => {
          // Suppression du livre dans la base de données
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé !" })) // Répond avec un message de succès
            .catch((error) => res.status(400).json({ error })); // Gère les erreurs
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
      // Gère les erreurs lors de la recherche du livre dans la base de données
    });
};

exports.addRating = async (req, res, next) => {
  const { id } = req.params; // ID du livre extrait des paramètres de la requête
  const { userId, rating } = req.body; // Données de la notation extraites du corps de la requête

  try {
    const book = await Book.findById(id); // Recherche du livre correspondant à l'ID fourni

    if (!book) {
      return res.status(404).json({ error: "Livre non trouvé" }); // Si le livre n'est pas trouvé, renvoie une erreur 404
    }

    // Vérification si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find(
      (rating) => rating.userId === userId
    );
    if (existingRating) {
      return res.status(400).json({ error: "Vous avez déjà noté ce livre" }); // Si l'utilisateur a déjà noté le livre, renvoie une erreur 400
    }

    // Ajoute la nouvelle notation au tableau "ratings"
    book.ratings.push({ userId, grade: rating });

    // Met à jour la propriété "averageRating" du livre en recalculant la note moyenne
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce(
      (sum, rating) => sum + rating.grade,
      0
    );
    book.averageRating = sumRatings / totalRatings;

    // Sauvegarde les modifications dans la base de données
    await book.save();

    // Répond avec un message de succès et le livre mis à jour
    res.status(200).json({ message: "Notation ajoutée avec succès", book });
  } catch (error) {
    // Gère les erreurs
    res.status(500).json({ error });
  }
};

// Récupère les 3 livres ayant la meilleure note moyenne
exports.getBestRatedBooks = (req, res, next) => {
  // Utilisation de la méthode find() pour récupérer tous les documents de la collection "Book"
  Book.find({})
    // Utilisation de la méthode sort() pour trier les résultats en fonction de la note moyenne (averageRating)
    .sort({ averageRating: -1 }) // Tri décroissant pour obtenir les meilleures notes en premier
    // Utilisation de la méthode limit() pour limiter le nombre de résultats à 3
    .limit(3)
    .then((books) => {
      // Renvoie une réponse JSON contenant les livres ayant la meilleure note
      res.status(200).json(books);
    })
    .catch((error) => {
      // Gère les erreurs
      res.status(500).json({ error });
    });
};
