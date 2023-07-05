// Charger les variables d'environnement à partir du fichier .env
require("dotenv").config();

// Importer le module http pour créer un serveur HTTP
const http = require("http");
// Importer l'application depuis le fichier app.js
const app = require("./app");

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
// Détermine la valeur du port à partir des variables d'environnement ou utilise le port par défaut 4000
const port = normalizePort(process.env.PORT || "4000");
app.set("port", port);

// Fonction pour gérer les erreurs lors du démarrage du serveur
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Crée un serveur HTTP avec l'application
const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

//Démarre le serveur en ecoutant le port qui est spécifié
server.listen(port);

//ce code configure et démarre un serveur HTTP qui écoute sur un port spécifié, en utilisant l'application définie dans le fichier app.js.
//Il gère également les erreurs éventuelles qui pourraient survenir lors du démarrage du serveur.
