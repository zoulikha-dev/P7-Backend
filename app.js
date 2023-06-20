const express = require("express");
const mongoose = require("mongoose");
const Book = require("./models/book");

//Permet d'interagir avec MongoDB à l'aide de Mongoose
mongoose
  .connect(
    "mongodb+srv://Zoulikha:Assiya3110@vieux-grimoire-cluster.ogqxfyn.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
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

app.use("/api/books");
app.use("/api/users");

module.exports = app;
