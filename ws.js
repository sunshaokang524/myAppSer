// 首先引入webSocket,创建一个服务器
let Ws = require("ws").Server;
// 设置端口号
console.log(12121)
let wss = new Ws({
  port: 3396,
});
// 监听是否有连接 接入
wss.on("connection", function (ws) {
  console.log("有连接");
  // 前端发过来的消息
  ws.on("message", (res) => {
    console.log(JSON.parse(res));
    // 发送数据
    ws.send(JSON.stringify({ name: "张三" }));
  });
});
