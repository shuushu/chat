let express = require('express');
let session = require('express-session');
let http = require('http');

let app = express();
let httpServer =http.createServer(app).listen(3500, function(){
    console.log('Socket IO server has been started');
});
let io = require('socket.io').listen(httpServer);


io.sockets.on('connection', function(socket){

    // 대화방 참석
    socket.on('joinroom',function(data){
        socket.join(data.roomID);

        // 접속자 닉네임
        socket.email = data.user.email;

    });


    // 메세지 송수신
    socket.on('message', (data) => {
        console.log('message' , data);
        // 자신을 제외하고 다른 클라이언트에게 보냄
        socket.broadcast.emit('toClient', data);
        // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
        socket.emit('toClient', data);
    });


    // 대화방 나가기
    socket.on('disconnect', (data) => {
        console.log('room OUT!', data);
        /*if(data[nickname] !== undefined) {
            delete data[nickname];
        }*/
    });
});

// 소켓연결
/*
io.sockets.on('connection',function(socket){
    console.log(socket.id)
    // 대화방 참석
    socket.on('joinroom',function(data){
        socket.join(data.roomID);

        // 접속자 닉네임
        socket.email = data.user.email;



    });
    // 대화방 나가기
    socket.on('disconnect', (data) => {
        console.log('room OUT!', data)
        /!*if(data[nickname] !== undefined) {
         delete data[nickname];
         }*!/
    });
});
*/
