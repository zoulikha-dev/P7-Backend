const Book = require("../models/book");

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
  const book = new Book({
    ...req.body, // Copie les données du corps de la requête pour créer le livre
  });
  book
    .save() // Enregistre le livre dans la base de données
    .then(() => res.status(201).json({ message: "Livre enregistré !" })) // Répond avec un message de succès
    .catch((error) => res.status(400).json({ error })); // Gère les erreurs
};

// Met à jour un livre existant
exports.modifyBook = (req, res, next) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Livre modifié !" })) // Répond avec un message de succès
    .catch((error) => res.status(400).json({ error })); // Gère les erreurs
};

// Supprime un livre
exports.deleteBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Livre supprimé !" })) // Répond avec un message de succès
    .catch((error) => res.status(400).json({ error })); // Gère les erreurs
};
