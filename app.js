const express = require("express");
const mongoose = require("mongoose");

const bookRoutes = require("./routes/books");
const userRoutes = require("./routes/auth");

const path = require("path");

//Permet d'interagir avec MongoDB à l'aide de Mongoose
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//Déclaration de notre app.
const app = express();

//Cette ligne de code permet à l'application Express de traiter les données JSON dans les requêtes entrantes(POST).
app.use(express.json());

// Cette fonction middleware est utilisée pour gérer les autorisations CORS.
// Elle est exécutée pour toutes les requêtes entrantes avant de passer aux routes correspondantes.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// déclarations de routes, utilisées pour définir les points d'entrée de l'API pour les fonctionnalités liées aux livres et à l'authentification.
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;

// Le fichier app.js est responsable de la configuration générale de l'application Express, de la connexion à la base de données et de la gestion des routes.
