const Koa = require('koa');  
const express = require('express');  
const { Server } = require('socket.io');  
const moment = require('moment');  
  
const app = express();  
const server = require('http').createServer(app);  
const io = new Server(server, {  
  serveClient: false,  
  cors: {  
    origin: '*', // from the screenshot you provided  
    methods: ['GET', 'POST'],  
  },  
});  
  
const chatList = [];  
console.log("chatList", chatList);
  
io.on('connection', (socket) => {  
  socket.emit('fresh-message', chatList);  
  
  socket.on('send-message', (user, message) => {  
    console .log("user", user,message);
    const createTime = moment().format('YYYY-MM-DD HH:mm:ss');  
    chatList.push({  
      user,  
      message,  
      createTime,  
    });  
    // 更新所有连接的客户端的聊天记录  
    io.emit('fresh-message', chatList);  
  });  
});  
  
// 启动服务器并监听端口  
server.listen(3001, () => {  
  console.log('Server is running on port 3001');  
});  
  
// 这里不需要Koa框架，因此将其相关代码移除