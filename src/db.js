/**
 * Created by HOON on 2017-07-11.
 */
let firebase = require("firebase");

firebase.initializeApp({
    serviceAccount: "../config/shushu-161f2c4f71e0.json",
    databaseURL: "https://shushu-cb26c.firebaseio.com"
});

// The app only has access to public data as defined in the Security Rules
let db = firebase.database();

export default db;