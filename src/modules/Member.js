import { createAction, handleActions } from 'redux-actions';
import { pender } from 'redux-pender';
import firebase from 'firebase';
import axios from 'axios';

const SET_INIT = 'SET_INIT';
const GET_LOGIN = 'GET_LOGIN';
const SET_LOGIN = 'SET_LOGIN';

const initialState  = {
    redirectToReferrer: true
};

const initAPI = (data) => {
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyBwc5tkZM3fEQcyPC1-HfguTbIt8woO9iA",
            authDomain: "shushu-cb26c.firebaseapp.com",
            databaseURL: "https://shushu-cb26c.firebaseio.com",
            storageBucket: "shushu-cb26c.appspot.com",
        });


        firebase.auth().onAuthStateChanged(function(user) {
            console.log('user', user)
            if (user) {
                // User is email in.
                initialState.name = user.email;
                initialState.uid = user.uid;
                initialState.redirectToReferrer = false;
            } else {
                console.log('n / ', user)
                // No user is signed in.
            }
        });
    }
};

const getLoginAPI = (data, callBack) => {
    return axios.post('/api/account/signin', data);
};

const setLoginAPI = (data) => {
    return axios.post('/api/account/signup', data);
};
/*
 [createAction 원형]
 export const getLogin = (index) => ({
 type: types.GET_LOGIN,
 index
 });
 */
export const getLogin = createAction(GET_LOGIN, getLoginAPI);
export const setLogin = createAction(SET_LOGIN, setLoginAPI);
export const initialrize = createAction(SET_INIT, initAPI);

export default handleActions({
    ...pender(
        {
            type: GET_LOGIN,
            onSuccess: (state, action) => {
                console.log(state)
            }
        },
        {
            type: SET_LOGIN,
            onSuccess: (state, action) => {
                console.log(state)
            }
        },
        {
            type: SET_INIT,
            onSuccess: (state, action) => {
                console.log(state)
            }
        }
    )
}, initialState);
