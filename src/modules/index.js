import { combineReducers } from 'redux';
import member from './Member';
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
    member,
    pender: penderReducer
});