const jwt = require("jsonwebtoken");

// Middleware d'authentification avec JSON Web Token (JWT)
module.exports = (req, res, next) => {
  try {
    // Extraction du token du header Authorization de la requête
    const token = req.headers.authorization.split(" ")[1];

    // Vérification et décryptage du token à l'aide de la clé secrète
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");

    // Récupération de l'identifiant de l'utilisateur depuis le token décrypté
    const userId = decodedToken.userId;

    // Ajout de l'identifiant de l'utilisateur à l'objet de requête (req)
    // afin qu'il soit accessible dans les prochains middlewares ou routes
    req.auth = {
      userId: userId,
    };

    // Appel de la fonction next() pour passer au prochain middleware ou à la route correspondante
    next();
  } catch (error) {
    // En cas d'erreur, renvoie d'une réponse d'erreur avec le code 401 (Non autorisé)
    res.status(401).json({ error });
  }
};
