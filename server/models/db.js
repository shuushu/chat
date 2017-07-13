let admin = require("firebase-admin");

//let serviceAccount = require("./shushu-161f2c4f71e0.json");
let serviceAccount = require("./shushu-cb26c-firebase-adminsdk-pcl1r-00ba1c59d0.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shushu-cb26c.firebaseio.com"
});

let db = admin.database();

module.exports = db;
