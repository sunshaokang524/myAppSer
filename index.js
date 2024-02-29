const express = require("express");
const fs = require("fs");
const fsp = require("fs").promises;
const api = express();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/myApp";
const cors = require("cors");
const uuid = require("node-uuid");
const CryptoJS = require("crypto-js");
const db = require("./api/type");
const path = require("path");
const AdmZip = require("adm-zip");

api.use(cors());

api.use("/img", express.static("img"));
function encrypt(text, key) {
  console.log(text, key);
  return CryptoJS.AES.encrypt(text, key).toString();
}
function decrypt(text, key) {
  return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8).toString();
}
function isTokenTimeout(token, res, handle) {
  jwt.verify(token.slice(7), "wodetokenhenniubi", (err, decode) => {
    if (err) {
      res.status(401).json({ error: "请重新登录" });
    } else {
      handle();
    }
  });
}
async function saveImage(filePath, imageBuffer) {
  try {
    await fsp.writeFile(filePath, imageBuffer, "binary");
    console.log("Image saved successfully to:", filePath);
  } catch (err) {
    console.error("Error saving image:", err);
  }
}
mongoose.connect(url);
mongoose.connection.on("connected", function () {
  console.log("连接成功：", url);
});

const bodyParser = require("body-parser");
// api.use(bodyParser.json());
api.use(bodyParser.json({ limit: "50mb" }));
api.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
api.listen(5000, "192.168.0.2", () => {
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
        account: req.body.userPhone.slice(0, 3) + data.length,
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
      let { id, phone, password, account } = data[0];
      res.send({
        data: pwc
          ? {
              id,
              phone,
              account,
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

const zipFilePath = path.join(__dirname, "/img/all.zip"); // 假设压缩包位于当前目录
const extractPath = path.join(__dirname, "/img/extracted");
const basePath = path.join(__dirname, "/img/");
// 获取动态
api.get("/dynamicstate", (req, res) => {
  isTokenTimeout(req.headers["authorization"], res, () => {
    let arr = [];

    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath);
      const AdmZip = require("adm-zip");
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(extractPath, true);
      db.Dynamicstate.find().sort({ time: -1 })
      .then((data) => {
        data.forEach(function (entry, i) {
          let picList=[]
          console.log(entry.imgPath)
          if(entry.imgPath.length>0){
            entry.imgPath.forEach(function (pic, i) {
              console.log(pic)
              const imagePath = path.join(extractPath, pic); // 假设图片文件名为image.jpg
              const imageBuffer = fs.readFileSync(imagePath).toString("base64");
              picList.push("data:image/jpeg;base64," + imageBuffer)
            })
          }
          arr.push({
            img: picList,
            content: entry.content,
            time: entry.time,
            isLike: false,
            nickname: entry.nickname,
          });
        });

        fsp
          .rm(extractPath, { recursive: true, force: true })
          .then(() => {
            console.log(
              "Directory and its contents deleted successfully:",
              extractPath
            );
          })
          .catch((err) => {
            console.error("Error deleting directory:", err);
          });
        res.send({
          data: { imgList: arr },
          message: "请求成功",
          code: 200,
        });
      });
    } // 解压目录
  });
});
// 添加动态
api.post("/addDynamic", (req, res) => {
  const { content, imgPath, id } = req.body;
  let arr=[]
  imgPath.forEach(function (pic, i) {
    const base64Data = pic.url.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = Buffer.from(base64Data, "base64");
    let picName=id+new Date().getTime()+pic.name
    const tempFilePath = `./img/${picName}`; // 临时文件路径  
    fs.writeFileSync(tempFilePath, dataBuffer);  
    const zip = new AdmZip('./img/all.zip');  
    // 图片在ZIP文件中的名称  
    const imageNameInZip = 'all';  
    // 将图片添加到ZIP文件中  
    zip.addLocalFile(tempFilePath, imageNameInZip);  
    fs.unlinkSync(tempFilePath);  
    // 将修改后的ZIP文件内容写回磁盘  
    zip.writeZip('./img/all.zip');  
    arr.push('all/'+ picName)
    
  })
    
  
  db.Personalinfo.find({id}).then(data=>{
    const {account, nickname}= data[0]
    console.log(account, nickname,encrypt( String(new Date().getTime()),account))
    let u = new db.Dynamicstate({
      nickname,
      content,
      id,
      imgPath:arr,
      time:new Date().getTime(),
      account,
      infoId:encrypt( String(new Date().getTime()),account)
    }) 
    u.save();
    res.send({
      data: { content, id,account, nickname },
      code: 200,
      message: "请求成功",
    });
  })
});

// 获取个人信息
api.get("/personInfo", (req, res) => {
  console.log(req.query);
  db.Personalinfo.find({ id: req.query.id }).then((data) => {
    console.log(data);
    if (data.length > 0) {
      res.send({
        data: data[0],
        code: 200,
        message: "请求成功",
      });
      console.log(data, "个人信息");
    } else {
      res.send({
        data: {},
        code: 406,
        message: "还未填写个人信息",
      });
    }
  });
});
// 添加个人信息
api.post("/personInfo", (req, res) => {
  let u = new db.Personalinfo(req.body);
  u.save();
  res.send({ data: req.body, code: 200, message: "请求成功" });
});
// 个人喜欢 删除
api.post("/myLick",(req,res)=>{
  let flag
  db.MyLick.find({id:req.body.id}).then(data=>{
    flag=data.length>0
  })
if(req.body.type==true){
  if(flag){

  }else{
    let u = new db.MyLick({id:req.body.id,likeList:[req.body.infoId]});
    u.save();

  }
}else{
  if(flag){
    db.MyLick.deleteOne({id:req.body.id}).then(data=>{
      
    })
  }
}
})