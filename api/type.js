const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  phone: String,
  password: String,
  id: String,
});
const User= mongoose.model("userinfos", userSchema);

module.exports = { User };
