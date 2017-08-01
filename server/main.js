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



// 소켓연결
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
        /*if(data[nickname] !== undefined) {
         delete data[nickname];
         }*/
    });
});

// Server ON:3500
server.listen(3500, () => console.log('listening on *:3500'));
