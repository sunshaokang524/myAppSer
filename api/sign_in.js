// const uuid = require("node-uuid");
// const express = require("express");
// const CryptoJS = require("crypto-js");
// const mongoose = require("mongoose");
// const api = express();
// function encrypt(key, text) {
//   return CryptoJS.AES.encrypt(text, key).toString();
// }
// let userSchema = new mongoose.Schema({
//   phone: String,
//   password: String,
//   id: String,
// });
// let User = mongoose.model("userinfos", userSchema);
// // 注册
// export default api.post("/signIn", (req, res) => {
//   User.find({ phone: req.body.userPhone }).then((data) => {
//     if (data.length > 0) {
//       res.send({ data: {}, code: 406, message: "手机号已被注册" });
//       return;
//     } else {
//       const uuid1 = uuid.v1();
//       req.body.passWord = encrypt("wodeappjiushihao", req.body.passWord);
//       let u = new User({
//         id: uuid1,
//         phone: req.body.userPhone,
//         password: req.body.passWord,
//       });
//       u.save();
//       res.send({ data: {}, code: 200, message: "注册成功！" });
//     }
//   });
// });
console.log(54545)