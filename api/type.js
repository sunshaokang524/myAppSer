const mongoose = require("mongoose");

// 创建用户信息模型
let userSchema = new mongoose.Schema({
  phone: String,
  password: String,
  id: String,
  account: String,
});
const User = mongoose.model("userinfos", userSchema);
// 创建个人信息模型
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
// 创建动态状态模型
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
// 创建点赞模型
let myLikeSchema = new mongoose.Schema({
  id:String,
  likeList:Array
})
const MyLike = mongoose.model("mylikes", myLikeSchema);
// 创建关注模型
let MyAttentionSchema = new mongoose.Schema({
  id:String,
  attentionList:Array
})
const MyAttention = mongoose.model("attentions", MyAttentionSchema);
let friendsSchema = new mongoose.Schema({
  cust_id:String,
  friends_list:[{
    friends_id:String,
    relation:String,
    state:String,
  }],
 
})
const Friends = mongoose.model("friends", friendsSchema);
let myinfolistSchema=new mongoose.Schema({
  id:String,
  infoList:Array
})
const MyInfoList =mongoose.model("myinfolists",myinfolistSchema)
module.exports = { User, Personalinfo,Dynamicstate,MyLike,MyAttention,Friends,MyInfoList};
