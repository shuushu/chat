import { combineReducers } from 'redux';
import { penderReducer } from 'redux-pender';
import { firebaseStateReducer } from 'react-redux-firebase'

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
    pender: penderReducer,
    firebase: firebaseStateReducer
});
