import { combineReducers } from 'redux';
import post from './Post';
import counter from './Counter';
import { penderReducer } from 'redux-pender';



/*
요청들을 관리하는 리듀서
{
    pending: {},
    success: {},
    failure: {}
}
구조로 나타남
*/
export default combineReducers({
    counter,
    post,
    pender: penderReducer
});