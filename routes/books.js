const express = require("express");
const bookCtrl = require("../controllers/book");
const auth = require("../middlewares/auth");
const {
  multerConfig,
  deleteOldImage,
  optimizeImage,
} = require("../middlewares/multer-config");

const router = express.Router();

// Route pour récupérer tous les livres
router.get("/", bookCtrl.getAllBooks);

// Route pour récupérer les 3 livres avec la meilleure note moyenne
router.get("/bestrating", bookCtrl.getBestRatedBooks);

// Route pour récupérer un livre par son ID
router.get("/:id", bookCtrl.getOneBook);

// Route pour créer un nouveau livre
router.post("/", auth, multerConfig, optimizeImage, bookCtrl.createBook);

// Route pour mettre à jour un livre existant
router.put("/:id", auth, multerConfig, deleteOldImage, bookCtrl.modifyBook);

// Route pour supprimer un livre
router.delete("/:id", auth, bookCtrl.deleteBook);

// Route pour ajouter une notation à un livre
router.post("/:id/rating", auth, bookCtrl.addRating);

module.exports = router;
