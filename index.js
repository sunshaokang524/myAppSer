const express = require("express");
const fs = require("fs");
const api = express();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/myApp";
const cors = require('cors')
const uuid = require('node-uuid');
const CryptoJS = require("crypto-js");
api.use(cors())

function encrypt(key,text){
  return CryptoJS.AES.encrypt(text,key).toString();
}
mongoose.connect(url);
mongoose.connection.on("connected", function () {
    console.log("连接成功：", url);
  });
  let userSchema = new mongoose.Schema({
    phone: String,
    password:String,
    id:String
  });
  let User = mongoose.model("userinfos", userSchema);
  const bodyParser = require("body-parser");

  api.use(bodyParser.json());
  api.use(bodyParser.urlencoded({ extended: false }));
  api.listen(3000, "192.168.0.2", () => {
    console.log("服务器启动");
  });
 

    // 注册
    api.post("/signIn", (req, res) => {
      const uuid1 = uuid.v1();
      req.body.passWord=encrypt('wodeappjiushihao',req.body.passWord)
      let u = new User({id:uuid1,phone:req.body.userPhone,password:req.body.passWord});
      u.save();
      res.send({data:{},code:200,message:'注册成功！'});
    });
