const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  phone: String,
  password: String,
  id: String,
});
const User= mongoose.model("userinfos", userSchema);
let personalinfoSchema = new mongoose.Schema({
  nickname: String,
  sex: String,
  phone: String,
  age: String,
  nativePlace:String,
  avatar:String,
  id:String,
});
const Personalinfo= mongoose.model("personalinfos", personalinfoSchema);
module.exports = { User,Personalinfo };
