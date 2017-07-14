let admin = require("firebase-admin");

//let serviceAccount = require("./shushu-161f2c4f71e0.json");
let serviceAccount = require("./shushu-cb26c-firebase-adminsdk-pcl1r-00ba1c59d0.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shushu-cb26c.firebaseio.com"
});

let uid = 'xSZeG46uzUfDAzGGLuzbIgZ0SAE3';

admin.auth().createCustomToken(uid)
    .then(function(customToken) {
        // Send token back to client
    })
    .catch(function(error) {
        console.log("Error creating custom token:", error);
    });

admin.auth().createUser({
    uid: uid,
    email: "hosoon2@gmail.com"
})
.then(function(userRecord) {
    // A UserRecord representation of the newly created user is returned
    console.log("Successfully created new user:", userRecord.uid);
})
.catch(function(error) {
    console.log("Error creating new user:", error);
});



let db = admin.database();

module.exports = db;
