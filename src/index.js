import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/Root';
import { Provider } from 'react-redux';
import store from './store';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase';
import { Login } from './containers/index';

firebase.initializeApp({
    apiKey: "AIzaSyBwc5tkZM3fEQcyPC1-HfguTbIt8woO9iA",
    authDomain: "shushu-cb26c.firebaseapp.com",
    databaseURL: "https://shushu-cb26c.firebaseio.com",
    storageBucket: "shushu-cb26c.appspot.com"
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        ReactDOM.render(
            <Provider store={store}>
                <Root/>
            </Provider>,
            document.getElementById('root')
        );
    } else {
        ReactDOM.render(
            <Login />,
            document.getElementById('root')
        );
    }
});


registerServiceWorker();
