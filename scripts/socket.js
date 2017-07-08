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
    // 게스트
    socket.emit('new', { nickname:'GUEST-'+count });

    registerUser(socket, 'GUEST-' + count);
    count++;

    socket.on('changeName', (data) => {
        registerUser(socket, data.nickname);
    });


    socket.on('message', (data) => {

        socket.broadcast.emit('toClient',data); // 자신을 제외하고 다른 클라이언트에게 보냄
        socket.emit('toClient', data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?

    });

    socket.emit('init', socket.id);

});



function registerUser(socket, nickname){
    // socket_id와 nickname 테이블을 셋업
    socket.get('nickname', (err, pre_nick) => {
        if(pre_nick !== undefined) delete socket_ids[pre_nick];

        socket_ids[nickname] = socket.id;
        socket.set('nickname', nickname, () => {
            websocket.emit('userList', {
                users: Object.keys(socket_ids)
            });
        });
    });
}