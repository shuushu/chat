import { createStore, applyMiddleware, compose } from 'redux';
import modules from './modules';
import ReduxThunk from 'redux-thunk';
import penderMiddleware from 'redux-pender';
import firebase from 'firebase';
import { reduxFirebase } from 'react-redux-firebase';

const fbConfig = {
	apiKey: "AIzaSyBwc5tkZM3fEQcyPC1-HfguTbIt8woO9iA",
	authDomain: "shushu-cb26c.firebaseapp.com",
	databaseURL: "https://shushu-cb26c.firebaseio.com",
	storageBucket: "shushu-cb26c.appspot.com"
}

firebase.initializeApp(fbConfig);

const config = {
  userProfile: 'users', // firebase root where user profiles are stored
  enableLogging: false, // enable/disable Firebase's database logging
}

const createStoreWithFirebase = compose(
  reduxFirebase(fbConfig, config),
)(createStore);


const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
        }) : compose;



const enhancer = composeEnhancers(
    applyMiddleware(ReduxThunk, penderMiddleware())
    // other store enhancers if any
);
const store = createStoreWithFirebase(modules, enhancer);



// 미들웨어가 여러개인경우에는 파라미터로 여러개를 전달해주면 됩니다. 예: applyMiddleware(a,b,c)
// 미들웨어의 순서는 여기서 전달한 파라미터의 순서대로 지정됩니다.
//const store = createStore(modules, applyMiddleware(loggerMiddleware))

export default store;
