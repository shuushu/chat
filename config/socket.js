let express = require('express');
let http = require('http');
let socketio = require('socket.io');

// SERVER
let app = express();
let server = http.Server(app);
let websocket = socketio(server);
// init
let rooms = [];
let count = 0;





server.listen(3500, () => console.log('listening on *:3500'));
// The event will be called when a client is connected.
websocket.on('connection', (socket) => {

    socket.on('joinroom', (data) => {
        socket.join(data.room);
        // 초기 닉네임
        socket.nickname = 'GUEST-'+count;

        // 닉네임 변경
        socket.on('changeNickName', (nickname) => {
            socket.broadcast.emit('toNick', nickname);
            socket.emit('toNick', nickname);
            socket.nickname = nickname;
        });

        if(rooms[data.room] === undefined) {
            console.log('room create : ' + data.room);
            // 클라이언트에 받은 값으로 방 설정
            rooms[data.room] = {};
            rooms[data.room].socket_ids = {};
        }
        // 현재 사용자 닉네임을 키값으로 socket.id를 저장
        rooms[data.room].socket_ids[socket.nickname] = socket.id;
        // 초기화
        socket.in(data.room).emit('init', {
            id: socket.id,
            nickname:'GUEST-'+count
        });
    });



    count++;

    // 메세지 송수신
    socket.on('message', (data) => {
        // 자신을 제외하고 다른 클라이언트에게 보냄
        socket.broadcast.emit('toClient', data);
        // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
        socket.emit('toClient', data);




        /*
         db.ref('chats/one').set({
             lastMessage: "ghopper: Relay malfunction found. Cause: moth.",
             timestamp: 101054378601,
             title: message
         }, () => {
            var starCountRef = db.ref('chats/one/title');

            starCountRef.on('value', function(snapshot) {
                socket.emit('toClient', snapshot.val());
                console.log('SNAPSHOT / ', snapshot.val());
            });
         });
         */

    });
    // 대화종료
    socket.on('disconnect', (data) => {
        /*if(data[nickname] !== undefined) {
            delete data[nickname];
        }*/
    });
    // 초기화
    socket.emit('init', {
        id: socket.id,
        nickname:'GUEST-'+count
    });
});