const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  phone: String,
  password: String,
  id: String,
});
const User = mongoose.model("userinfos", userSchema);
let personalinfoSchema = new mongoose.Schema({
  nickname: String,
  sex: String,
  phone: String,
  age: String,
  nativePlace: String,
  avatar: String,
  id: String,
});
const Personalinfo = mongoose.model("personalinfos", personalinfoSchema);
let dynamicstateSchema = new mongoose.Schema({
  nickname: String,
  avatar: String,
  id: String,
  time: String,
  isLike: Boolean,
  content: String,
  imgPath: Array,
});
const Dynamicstate = mongoose.model("dynamicstates", dynamicstateSchema);
module.exports = { User, Personalinfo,Dynamicstate };
