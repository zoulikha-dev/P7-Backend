const bcrypt = require("bcrypt"); //Permet de sécuriser le mdp des utilisateurs
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Fonction pour créer un nouvel utilisateur
exports.signup = (req, res, next) => {
  // Utilise bcrypt pour hacher le mot de passe de l'utilisateur
  bcrypt
    .hash(req.body.password, 10) // Ce chiffre détermine la complexité du hachage
    .then((hash) => {
      // Crée un nouvel utilisateur avec l'adresse e-mail et le mot de passe haché
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // Enregistre l'utilisateur dans la base de données
      user
        .save()
        // Si enregistrement est réussi, renvoie un message de succès
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        // Si une erreur se produit lors de l'enregistrement, renvoie l'erreur 400
        .catch((error) => res.status(400).json({ error }));
    })
    // Si une erreur se produit lors du hachage du mot de passe, renvoie l'erreur 500
    .catch((error) => res.status(500).json({ error }));
};

// Fonction pour gérer la connexion d'un utilisateur
exports.login = (req, res, next) => {
  // Recherche l'utilisateur correspondant à l'adresse e-mail fournie dans la base de données
  User.findOne({ email: req.body.email })
    .then((user) => {
      // Vérifie si aucun utilisateur n'a été trouvé avec cette adresse e-mail
      if (!user) {
        // Si aucun utilisateur n'est trouvé, renvoie une erreur de connexion
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      // Utilise bcrypt pour comparer le mot de passe fourni avec le mot de passe enregistré dans la base de données
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // Vérifie si les mots de passe correspondent
          if (!valid) {
            // Si les mots de passe ne correspondent pas, renvoie une erreur de connexion
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }
          // Si les informations d'identification sont correctes, renvoie un identifiant d'utilisateur et un jeton d'authentification
          res.status(200).json({
            // Utilisation de la fonction sign afin de chiffrer un nouveau token. le token contient l'user ID encodée et la clé secrète d'encodage.
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h", // chaque token dure 24h
            }),
            userId: user._id,
          });
        })
        .catch((error) => {
          // Si une erreur se produit lors de la comparaison des mots de passe, renvoie l'erreur correspondante
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      // Si une erreur se produit lors de la recherche de l'utilisateur, renvoie l'erreur correspondante
      res.status(500).json({ error });
    });
};
