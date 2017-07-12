import db from '../db';
import { createAction, handleActions } from 'redux-actions';
import { pender } from 'redux-pender';

const SET_INIT = 'SET_INIT';
const GET_LOGIN = 'GET_LOGIN';
const SET_LOGIN = 'SET_LOGIN';

const initialState  = {
    socketID: '',
    nick: ''
};

const initAPI = (data) => {
    initialState.socketID = data.id;
    initialState.nick = data.nickname;
};

const getLoginAPI = (data, callBack) => {
    let ref = db.ref('member');

    ref.on('child_added', (snapshot)=>{
        let { id, pw } = snapshot.val();

        if(id === data.id && pw === data.pw) {
            alert('Login success');
            callBack();
        } else {
            console.log('login fail');
        }
    })
};

const setLoginAPI = (data) => {
    let ref = db.ref('member');

    ref.once('child_added', (snapshot)=>{
        let { id }  = snapshot.val();

        if(id === data.id) {
            alert('아이디가 존재');
            return false;
        } else {
            ref.push({
                id: data.id,
                pw: data.pw,
            });
        }
    })
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
    ...pender({
        type: GET_LOGIN,
        onSuccess: (state, action) => {
            console.log(state)
        }
    })
}, initialState);
