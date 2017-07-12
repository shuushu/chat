let express = require('express');
let account = require('./account');

let router = express.Router();
router.use('/account', account);

module.exports = router;