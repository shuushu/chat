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

//app.use('/api', api);
// 소켓연결
io.on('connection', function(socket){
  console.log('a user connected');
});


// Server ON:3500
server.listen(3500, () => console.log('listening on *:3500'));
