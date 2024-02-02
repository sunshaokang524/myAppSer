const express = require("express");
const fs = require("fs");
const api = express();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/myApp";
const cors = require('cors')
api.use(cors())
mongoose.connect(url);
mongoose.connection.on("connected", function () {
    console.log("连接成功：", url);
  });
  let userSchema = new mongoose.Schema({
    account: String,
    userName: String,
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
  // User.find().then((result) => {
  //   console.log(result,'445')
  //   });
    // 注册
    api.post("/signIn", (req, res) => {
      console.log(req.body)
      res.send("请求成功！");
    });
