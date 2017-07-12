let express = require('express');
let session = require('express-session');
let http = require('http');

let app = express();
let server = http.Server(app);
/* setup routers & static directory */
let api = require('./routes');
app.use('/api', api);

// Server ON:3500
server.listen(3500, () => console.log('listening on *:3500'));

/* use session */
app.use(session({
    secret: 'CodeLab1$1$234',
    resave: false,
    saveUninitialized: true
}));



