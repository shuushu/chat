/*
let express = require('express');
let router = express.Router();


router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.post('/signup', (req, res) => {
    let sess;
    sess = req.session;

    console.log(res);
    return res.json({ success: true });
});

router.post('/signin', (req, res) => {
    /!* to be implemented *!/
    res.json({ success: true });
});

router.get('/getinfo', (req, res) => {
    res.json({ info: null });
});

router.post('/logout', (req, res) => {
    return res.json({ success: true });
});

module.exports = router;*/



let express = require('express');
let router = express.Router();
let db = require('../models/db');

 // middleware that is specific to this router
 router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
 });


 // define the about route
 router.get('/signin', function(req, res) {

    let ref = db.ref('member');

    ref.on('child_added', (snapshot)=>{
        let { id, pw } = snapshot.val();

        if(id === data.id && pw === data.pw) {
            alert('Login success');
        } else {
            console.log('login fail');
        }
    });

    //res.send('About birds');
 });

router.post('/signup', function(req, res) {
    console.log(req.params)
    db.ref('member').on('child_added', (snapshot)=>{
        let { id, pw }  = snapshot.val();


        if(id === req.id) {
            console.log('fail');
        } else {
/*            db.ref('member').push({
                id: req.id,
                pw: req.pw,
            }, () => {
                res.send('success');
            })*/
        }
    });
});

 module.exports = router;
