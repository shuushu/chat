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



var socket_ids = [];
var count = 0;
 
function registerUser(socket,nickname){
    // socket_id와 nickname 테이블을 셋업
    socket.get('nickname',function(err,pre_nick){
        if(pre_nick != undefined ) delete socket_ids[pre_nick];
        socket_ids[nickname] = socket.id
        socket.set('nickname',nickname,function(){
            io.sockets.emit('userlist',{users:Object.keys(socket_ids)});
        });
 
    });
}

app.get('/roomList/:user',function(req,res){
    console.log('room name is :'+req.params.room);
    res.render('index',{room:req.params.room});
});


// 소켓연결
io.sockets.on('connection',function(socket){
	socket.on('joinroom',function(data){
        socket.join(data.user);
    });
});

// Server ON:3500
server.listen(3500, () => console.log('listening on *:3500'));
