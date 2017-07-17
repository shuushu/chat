import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App'
import firebase from 'firebase';

firebase.initializeApp({
    apiKey: "AIzaSyBwc5tkZM3fEQcyPC1-HfguTbIt8woO9iA",
    authDomain: "shushu-cb26c.firebaseapp.com",
    databaseURL: "https://shushu-cb26c.firebaseio.com",
    storageBucket: "shushu-cb26c.appspot.com",
});

const Root = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

export default Root;