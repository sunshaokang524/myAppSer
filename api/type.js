const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  phone: String,
  password: String,
  id: String,
  account: String,
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
  account: String,
});
const Personalinfo = mongoose.model("personalinfos", personalinfoSchema);
let dynamicstateSchema = new mongoose.Schema({
  nickname: String,
  infoId: String,
  id: String,
  time: String,
  account: String,
  content: String,
  imgPath: Array,
});
const Dynamicstate = mongoose.model("dynamicstates", dynamicstateSchema);
let myLikeSchema = new mongoose.Schema({
  id:String,
  likeList:Array
})
const MyLike = mongoose.model("mylikes", myLikeSchema);
let MyAttentionSchema = new mongoose.Schema({
  id:String,
  attentionList:Array
})
const MyAttention = mongoose.model("attentions", MyAttentionSchema);
module.exports = { User, Personalinfo,Dynamicstate,MyLike,MyAttention};
