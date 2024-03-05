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
mongoose.connect(url);
mongoose.connection.on("connected", function () {
  console.log("连接成功：", url);
});

const bodyParser = require("body-parser");
api.use(bodyParser.json({ limit: "50mb" }));
api.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
api.listen(5000, "192.168.0.2", () => {
  console.log("服务器启动");
});
// 加密函数，text为要加密的文本，key为加密的密钥
function encrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}
// 解密函数，用于解密文本
function decrypt(text, key) {
  // 使用CryptoJS.AES.decrypt()函数对文本进行解密，并使用CryptoJS.enc.Utf8将解密后的文本转换为Utf8编码
  return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8).toString();
}
// 函数：isTokenTimeout，用于验证token是否过期
// 参数：token，res，handle
function isTokenTimeout(token, res, handle) {
  // 使用jwt.verify验证token，并传入验证的参数，以及回调函数
  jwt.verify(token.slice(7), "wodetokenhenniubi", (err, decode) => {
    // 如果验证失败，则返回401状态码，并返回错误信息
    if (err) {
      res.status(401).json({ error: "请重新登录" });
    } else {
      // 如果验证成功，则调用handle函数
      handle();
    }
  });
}
async function saveImage(filePath, imageBuffer) {
  try {
    await fsp.writeFile(filePath, imageBuffer, "binary");
  } catch (err) {
    console.error("Error saving image:", err);
  }
}
// 添加信息列表
function addInfoList(myid, type, content, sendPerId, time) {
  console.log("添加信息列表", { myid, type, content, sendPerId, time });
  let arr =[]
  let item = {
    myid, type, content, sendPerId, time,isRead:false
  }
  db.MyInfoList.find({ id: myid }).then((data) => {

    console.log("查询到的信息列表", data);
    if (data.length == 0) {
      arr.push(item)
      console.log("创建新的信息列表", new db.MyInfoList());

      let u = new db.MyInfoList({
        id: myid,
        infoList:arr
      });
      u.save();
    } else {
      db.MyInfoList.updateOne(
        { id: myid },
        {
          $push: { infoList: item },
        }
      ).then((res) => {});
    }
  });
}

// 注册
api.post("/signIn", (req, res) => {
  // 查询数据库中是否有该手机号的用户
  db.User.find({ phone: req.body.userPhone }).then((data) => {
    if (data.length > 0) {
      res.send({ data: {}, code: 406, message: "手机号已被注册" });
      return;
    } else {
      // 生成一个uuid
      const uuid1 = uuid.v1();
      // 对密码进行加密
      req.body.passWord = encrypt(req.body.passWord, "wodeappjiushihao");
      console.log(
        req.body.userPhone.slice(0, 3) + (data.length + 1),
        req.body.userPhone
      );
      let u = new db.User({
        id: uuid1,
        phone: req.body.userPhone,
        password: req.body.passWord,
        account: req.body.userPhone.slice(0, 3) + (data.length + 1),
      });
      u.save();
      res.send({ data: {}, code: 200, message: "注册成功！" });
    }
  });
});

// 登录
api.post("/login", (req, res) => {
  db.User.find({ phone: req.body.phone }).then((data) => {
    // 判断手机号是否已注册
    if (data.length > 0) {
      // 判断密码是否正确
      let pwc =
        decrypt(data[0].password, "wodeappjiushihao") === req.body.passWord
          ? true
          : false;
      // 获取用户信息
      let { id, phone, password, account } = data[0];
      // 返回登录信息
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
      // 返回未注册信息
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
  isTokenTimeout(req.headers["authorization"], res, async () => {
    let arr = [];

    // 判断解压目录是否存在，不存在则创建
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath);
      const AdmZip = require("adm-zip");
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(extractPath, true);
      let sum;
      try {
        sum = await db.Dynamicstate.countDocuments();
      } catch (err) {
        console.log(err);
      }
      // 查询数据
      db.Dynamicstate.find()
        .sort({ time: -1 })
        .skip((req.query.pageNum - 1) * req.query.pageSize)
        .limit(req.query.pageSize)
        .then((data) => {
          data.forEach(function (entry, i) {
            let picList = [];

            // 判断图片路径是否存在，存在则读取图片
            if (entry.imgPath.length > 0) {
              entry.imgPath.forEach(function (pic, i) {
                const imagePath = path.join(extractPath, pic); // 假设图片文件名为image.jpg
                const imageBuffer = fs
                  .readFileSync(imagePath)
                  .toString("base64");
                picList.push("data:image/jpeg;base64," + imageBuffer);
              });
            }
            // 将图片列表、内容、时间、是否点赞、昵称、信息id添加到数组中
            arr.push({
              img: picList,
              content: entry.content,
              time: entry.time,
              isLike: false,
              nickname: entry.nickname,
              infoId: entry.infoId,
              account: entry.account,
            });
          });

          // 删除解压目录
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

          // 判断是否点赞
          db.MyLike.find({ id: req.query.id }).then((data) => {
            if (data.length === 0) {
              res.send({
                data: { imgList: arr, sum: sum },
                message: "请求成功",
                code: 200,
              });
            } else {
              arr.forEach((item, i) => {
                item.isLike = data[0].likeList.includes(item.infoId);
              });
              res.send({
                data: { imgList: arr, sum: sum },
                message: "请求成功",
                code: 200,
              });
            }
          });
        });
    } // 解压目录
  });
});
// 添加动态
api.post("/addDynamic", (req, res) => {
  const { content, imgPath, id } = req.body;
  let arr = [];
  imgPath.forEach(function (pic, i) {
    const base64Data = pic.url.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = Buffer.from(base64Data, "base64");
    let picName = id + new Date().getTime() + pic.name;
    const tempFilePath = `./img/${picName}`; // 临时文件路径
    fs.writeFileSync(tempFilePath, dataBuffer);
    const zip = new AdmZip("./img/all.zip");
    // 图片在ZIP文件中的名称
    const imageNameInZip = "all";
    // 将图片添加到ZIP文件中
    zip.addLocalFile(tempFilePath, imageNameInZip);
    fs.unlinkSync(tempFilePath);
    // 将修改后的ZIP文件内容写回磁盘
    zip.writeZip("./img/all.zip");
    arr.push("all/" + picName);
  });

  db.Personalinfo.find({ id }).then((data) => {
    const { account, nickname } = data[0];

    let u = new db.Dynamicstate({
      nickname,
      content,
      id,
      imgPath: arr,
      time: new Date().getTime(),
      account,
      infoId: encrypt(String(new Date().getTime()), account),
    });
    u.save();
    res.send({
      data: { content, id, account, nickname },
      code: 200,
      message: "请求成功",
    });
  });
});

// 获取个人信息
api.get("/personInfo", (req, res) => {
  // 查询数据库中id为req.query.id的Personalinfo数据
  db.Personalinfo.find({ id: req.query.id }).then((data) => {
    if (data.length > 0) {
      res.send({
        data: data[0],
        code: 200,
        message: "请求成功",
      });
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
api.post("/myLike", (req, res) => {
  let flag;
  db.MyLike.find({ id: req.body.id }).then((data) => {
    flag = data.length > 0;
    if (req.body.type == true) {
      if (flag) {
        // 更新收藏信息
        db.MyLike.updateOne(
          { id: req.body.id },
          { $push: { likeList: req.body.infoId } }
        ).then((res) => {
          console.log(res);
        });
      } else {
        // 插入收藏信息
        let u = new db.MyLike({ id: req.body.id, likeList: [req.body.infoId] });
        u.save();
      }
      res.send({
        data: { infoId: req.body.infoId },
        code: 200,
        message: "收藏成功！",
      });
    } else {
      if (flag) {
        // 更新收藏信息
        db.MyLike.updateOne(
          { id: req.body.id },
          { $pull: { likeList: req.body.infoId } }
        ).then((data) => {
          res.send({
            data: { infoId: req.body.infoId },
            code: 200,
            message: "取消收藏！",
          });
        });
      }
    }
  });
});
// 获取其他人信息
api.get("/otherInfo", (req, res) => {
  db.Personalinfo.find({ account: req.query.account }).then((data) => {
    const { account, nickName, sex, age, avatar, nativePlace, id } = data[0];
    db.MyAttention.find({ id: req.query.id }).then((data) => {
      db.Friends.find({ cust_id: req.query.id }).then((item) => {
        let isFriend = [];
        if (item.length > 0) {
          isFriend = item[0].friends_list.filter((it) => it.friends_id == id);
        }

        res.send({
          data: {
            account,
            nickName,
            sex,
            age,
            avatar,
            nativePlace,
            isattention:
              data[0]?.attentionList.indexOf(req.query.account) > -1
                ? true
                : false,
            isFriend: isFriend.length > 0 ? isFriend[0].state : "no",
          },
          code: 200,
          message: "请求成功",
        });
      });
    });
  });
});

// 添加个人关注
api.post("/addAttention", (req, res) => {
  let flag;

  db.MyAttention.find({ id: req.body.id }).then((data) => {
    flag = data.length > 0;
    if (req.body.type == true) {
      if (flag) {
        // 更新收藏信息
        db.MyAttention.updateOne(
          { id: req.body.id },
          { $push: { attentionList: req.body.account } }
        ).then((res) => {
          console.log(res);
        });
      } else {
        // 插入收藏信息
        let u = new db.MyAttention({
          id: req.body.id,
          attentionList: [req.body.account],
        });
        u.save();
      }
      res.send({ data: {}, code: 200, message: "关注成功！" });
    } else {
      if (flag) {
        // 更新收藏信息
        db.MyAttention.updateOne(
          { id: req.body.id },
          { $pull: { attentionList: req.body.account } }
        ).then((data) => {
          res.send({ data: {}, code: 200, message: "取消关注！" });
        });
      }
    }
  });
});

// 添加好友
api.post("/addFriends", (req, res) => {
  db.Personalinfo.find({ account: req.body.account }).then((data) => {
    // data[0].id
    db.Friends.find({ cust_id: req.body.id }).then((item) => {
      if (item.length > 0) {
        //检查是否已经存在该id的记录
        let flag = item[0].friends_list.filter((it) => {
          return it.friends_id === data[0].id;
        });
        if (flag.length > 0) {
          if (flag[0].state === "pending") {
            res.send({
              data: {},
              code: 200,
              message: "已添加好友，请等待对方同意！",
            });
          } else if (flag[0].state === "agree") {
            res.send({ data: {}, code: 200, message: "已添加好友！" });
          } else if (flag[0].state === "refuse") {
            res.send({
              data: {},
              code: 200,
              message: "对方已拒绝添加你为好友！",
            });
          }
        } else {
          db.Friends.updateOne(
            { cust_id: req.body.id },
            {
              $push: {
                friends_list: {
                  friends_id: data[0].id,
                  relation: "initiative", //主动
                  state: "pending",
                },
              },
            }
          );
          db.Friends.find({ cust_id: data[0].id }).then((info) => {
            if (info.length > 0) {
              //删除已存在的请求
              db.Friends.updateOne(
                { cust_id: data[0].id },
                {
                  $push: {
                    friends_list: {
                      friends_id: req.body.id,
                      relation: "passivity", //被动
                      state: "pending",
                    },
                  },
                }
              );
            } else {
              let v = new db.Friends({
                cust_id: data[0].id,
                friends_list: [
                  {
                    friends_id: req.body.id,
                    relation: "passivity", // 被动
                    state: "pending",
                  },
                ],
              });
              v.save();
            }
            addInfoList(
              data[0].id,
              "0",
              "请求添加好友",
              req.body.id,
              new Date()
            );
          });
          res.send({
            data: {},
            code: 200,
            message: "已发出好友请求，请等待对方同意",
          });
        }
      } else {
        let u = new db.Friends({
          cust_id: req.body.id,
          friends_list: [
            {
              friends_id: data[0].id,
              relation: "initiative", //主动
              state: "pending",
            },
          ],
        });

        u.save();
        db.Friends.find({ cust_id: data[0].id }).then((info) => {
          if (info.length > 0) {
            db.Friends.updateOne(
              { cust_id: data[0].id },
              {
                $push: {
                  friends_list: {
                    friends_id: req.body.id,
                    relation: "passivity", //被动
                    state: "pending",
                  },
                },
              }
            );
          } else {
            let v = new db.Friends({
              cust_id: data[0].id,
              friends_list: [
                {
                  friends_id: req.body.id,
                  relation: "passivity", // 被动
                  state: "pending",
                },
              ],
            });
            v.save();
          }
          addInfoList(data[0].id, "0", "请求添加好友", req.body.id, new Date());
          res.send({
            data: {},
            code: 200,
            message: "已发出好友请求，请等待对方同意",
          });
        });
      }
    });
  });
});

// 查看好友信息

api.post("/friendsInfo", (req, res) => {
  db.Friends.find({ cust_id: req.query.id }).then((data) => {
    if (data.length === 0) {
      res.send({ data: item, code: 200, message: "暂无消息" });
    }
    let item = data[0].friends_list.filter(
      (v) => v.relation === "initiative" && state === "pending"
    );
    console.log(item);
    res.send({ data: item, code: 200, message: "取消关注！" });
  });
});


//获取好友消息
api.get('/getInfo',(req,res)=>{
  isTokenTimeout(req.headers["authorization"], res, async () => {
    db.MyInfoList.find({id:req.query.id}).then(data=>{
      res.send({data:data,code:200,message:'获取成功'})
    })
    
  })
})