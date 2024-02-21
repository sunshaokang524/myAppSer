const express = require("express");
const fs = require("fs");
const api = express();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/myApp";
const cors = require("cors");
const uuid = require("node-uuid");
const CryptoJS = require("crypto-js");
const db = require("./api/type");
const path = require("path");
api.use(cors());

api.use("/img", express.static("img"));
function encrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}
function decrypt(text, key) {
  return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8).toString();
}
function isTokenTimeout(token, res,handle) {

  jwt.verify(token.slice(7), "wodetokenhenniubi", (err, decode) => {
    if (err) {
      res.status(401).json({ error: "请重新登录" });
    } else {
      handle()
    }
  });

}
mongoose.connect(url);
mongoose.connection.on("connected", function () {
  console.log("连接成功：", url);
});
const bodyParser = require("body-parser");
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: false }));
api.listen(5000, "192.168.255.174", () => {
  console.log("服务器启动");
});

// 注册
api.post("/signIn", (req, res) => {
  db.User.find({ phone: req.body.userPhone }).then((data) => {
    if (data.length > 0) {
      res.send({ data: {}, code: 406, message: "手机号已被注册" });
      return;
    } else {
      const uuid1 = uuid.v1();
      req.body.passWord = encrypt(req.body.passWord, "wodeappjiushihao");
      let u = new db.User({
        id: uuid1,
        phone: req.body.userPhone,
        password: req.body.passWord,
      });
      u.save();
      res.send({ data: {}, code: 200, message: "注册成功！" });
    }
  });
});

// 登录
api.post("/login", (req, res) => {
  db.User.find({ phone: req.body.phone }).then((data) => {
    if (data.length > 0) {
      let pwc =
        decrypt(data[0].password, "wodeappjiushihao") === req.body.passWord
          ? true
          : false;
      let { id, phone, password } = data[0];
      res.send({
        data: pwc
          ? {
              id,
              phone,
              token: jwt.sign({ id, phone, password }, "wodetokenhenniubi", {
                expiresIn: 6 * 60 * 60,
              }),
            }
          : {},
        code: pwc ? 200 : 406,
        message: pwc ? "登录成功！" : "密码错误，请重新确认！",
      });
    } else {
      res.send({
        data: data,
        code: 406,
        message: "手机号未注册请确认！",
      });
    }
  });
});
console.log(0)
// 轮播背景
api.get("/swipe", (req, res) => {
  console.log(1)
  isTokenTimeout(req.headers["authorization"], res, () => {
    console.log(2)

    fs.readdir("./img", (err, file) => {
      let arr = file.map((item, i) => ({
        url: "img/" + item,
        text: item.slice(0, -4),
      }));
      console.log(arr);

      res.send({
        data: { imgList: arr },
        message: "请求成功",
        code: 200,
      });
    });
  });
});
api.get("/personInfo",(req,res)=>{
  db.Personalinfo.find({id:req.body.id}).then((data)=>{
    if(data.length>0){
      res.send({
        data:data[0],
        code:200,
        message:'请求成功'
      })
      console.log(data,'个人信息')
    }else{
      res.send({
        data:{},
        code:406,
        message:'还未填写个人信息'
      })
    }
  })
})