const express = require("express");
const bookCtrl = require("../controllers/book");
const multer = require("../middlewares/multer-config");

const router = express.Router();

// Route pour récupérer tous les livres
router.get("/", auth, bookCtrl.getAllBooks);

// Route pour récupérer un livre par son ID
router.get("/:id", auth, bookCtrl.getOneBook);

// Route pour créer un nouveau livre
router.post("/", auth, multer, bookCtrl.createBook);

// Route pour mettre à jour un livre existant
router.put("/:id", auth, multer, bookCtrl.modifyBook);

// Route pour supprimer un livre
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
