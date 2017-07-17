import { createAction, handleActions } from 'redux-actions';
import { pender } from 'redux-pender';
import axios from 'axios';

const GET_LOGIN = 'GET_LOGIN';
const SET_LOGIN = 'SET_LOGIN';

const initialState  = {

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
        }
    )
}, initialState);
