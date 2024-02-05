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

api.use(cors());

function encrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}
function decrypt(text, key) {
  return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8).toString();
}
mongoose.connect(url);
mongoose.connection.on("connected", function () {
  console.log("连接成功：", url);
});
const bodyParser = require("body-parser");
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: false }));
api.listen(3000, "192.168.0.2", () => {
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
// decoded = jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ODQwNWQwLWMzZDYtMTFlZS04OWU3LTg3YmZlNzM5ODJkMiIsInBob25lIjoiMTMzMTMzNTQyODQiLCJwYXNzd29yZCI6IlUyRnNkR1ZrWDErK3JRUDY3ZlBkb0wxRDA0OFNqWmV6d3d5RFp4R2hLTzg9IiwiaWF0IjoxNzA3MTI1MTkwLCJleHAiOjE3MDcxMjUyMDB9.NeCY68rafUfRBxXJ6UK_769NU8eCXcUs-QNx4JOOQHc', 'wodeappjiushihao');
// console.log(decoded,'decoded')
// 登录 
api.post("/login", (req, res) => {
  db.User.find({ phone: req.body.phone }).then((data) => {
    if (data.length > 0) {
      let pwc = decrypt(data[0].password, "wodeappjiushihao")===req.body.passWord?true:false;
      let {id,phone,password}=data[0] 
      res.send({
        data:pwc? {id,phone,token:jwt.sign({id,phone,password}, 'wodetokenhenniubi', { expiresIn: 10 })}:{},
        code: 200,
        message:pwc?'登录成功！':'密码错误，请重新确认！',
      });
    } else {
      res.send({
        data: data,
        code: 200,
        message: "手机号未注册请确认！",
      });
    }
  });
});


api.get('/test',(req,res)=>{
  console.log(req['authorization'])
  res.send('cc')
})
