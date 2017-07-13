let express = require('express');
let router = express.Router();
let db = require('../models/db');

 // middleware that is specific to this router
 router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
 });

/*
 ERROR CODES
 1: NOT LOGGED IN
 2: EMPTY CONTENTS
 */
 router.post('/signin', function(req, res) {
     // Error
     if(req.body.contents === "") {
         return res.status(400).json({
             error: "EMPTY CONTENTS",
             code: 2
         });
     }

     db.ref('member').on('child_added', (snapshot)=>{
        let { id, pw } = snapshot.val();

        console.log('db / ', req.body);

        if(id === req.body.id && pw === req.body.pw) {
            console.log('login success');
        } else {
            console.log('login fail');
        }
    });

    res.send('signin');
 });

router.post('/signup', function(req, res) {
    let reqID = req.body.id;
    let reqPW = req.body.pw;

    db.ref('member').on('child_added', function(snapshot) {
        let { id }  = snapshot.val();

        if(id === reqID) {
            res.send('fail');
        } else {
            db.ref('member').push({
                id: reqID,
                pw: reqPW,
            }, function() {
                return res.send('success');
            });
        }
    });
});

 module.exports = router;
