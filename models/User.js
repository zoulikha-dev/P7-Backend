const mongoose = require("mongoose");
// Import du plugin mongoose-unique-validator qui ajoute une validation unique aux champs spécifiés dans le schéma
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, require: true },
});

userSchema.plugin(uniqueValidator);
//la valeur unique , avec l'élément mongoose-unique-validator passé comme plug-in, s'assurera que deux utilisateurs ne puissent partager la même adresse e-mail.

module.exports = mongoose.model("User", userSchema);
