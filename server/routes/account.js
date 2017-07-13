let express = require('express');
let router = express.Router();
let db = require('../models/db');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});


// define the about route
router.post('/signin', function(req, res) {
    db.ref('member').on('child_added', function(snapshot) {
        let { id, pw } = snapshot.val();

        if(id === req.body.id && pw === req.body.pw) {
            return 1;
        } else {
            return 0;
        }
    });


});

router.post('/signup', function(req, res) {
    db.ref('member').on('child_added', (snapshot)=>{
        let { id, pw }  = snapshot.val();

        if(id === req.body.id) {
            console.log('fail');
        } else {
            db.ref('member').push({
             id: req.body.id,
             pw: req.body.pw,
            }, () => {
                res.send('success');
            })
        }
    });
});

module.exports = router;
