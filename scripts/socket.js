/**
 * Created by HOON on 2017-07-07.
 */
var express = require('express');
var http = require('http');
var socketio = require('socket.io');

var app = express();
var server = http.Server(app);
var websocket = socketio(server);

var firebase = require("firebase");

firebase.initializeApp({
    serviceAccount: "../config/shushu-161f2c4f71e0.json",
    databaseURL: "https://shushu-cb26c.firebaseio.com"
});

// The app only has access to public data as defined in the Security Rules
var db = firebase.database();

// init
let socket_ids = [];
let count = 0;





server.listen(3500, () => console.log('listening on *:3500'));
// The event will be called when a client is connected.
websocket.on('connection', (socket) => {

    count++;
    // 닉네임 변경
    socket.on('changeNickName', (nickname) => {
        socket.broadcast.emit('toNick', nickname);
        socket.emit('toNick', nickname);
    });
    // 메세지 송수신
    socket.on('message', (data) => {
        // 자신을 제외하고 다른 클라이언트에게 보냄
        socket.broadcast.emit('toClient', data);
        // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
        socket.emit('toClient', data);
    });
    // 초기화
    socket.emit('init', {
        id: socket.id,
        nickname:'GUEST-'+count
    });

});

