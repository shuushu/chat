let express = require('express');
let session = require('express-session');
let http = require('http');
let bodyParser = require('body-parser');


let app = express();
let server = http.Server(app);
let io = require('socket.io')(server);
/* setup routers & static directory */
let api = require('./routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


let nsp = io.of('/roomView');

nsp.on('connection', function(socket){
    // 대화방 참석
    socket.on('joinroom',function(data){
        socket.join(data.roomID);

        // 접속자 닉네임
        socket.email = data.user.email;

        console.log(socket.email)
    });


    // 메세지 송수신
    socket.on('message', (data) => {
        console.log(data);
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

// Server ON:3500
server.listen(3500, () => console.log('listening on *:3500'));
