import { combineReducers } from 'redux';
import { penderReducer } from 'redux-pender';

const init = {
    a: 'bb'
};
/*
요청들을 관리하는 리듀서
{
    pending: {},
    success: {},
    failure: {}
}
구조로 나타남
*/
const rootReducer = combineReducers({
    init,
    pender: penderReducer
});


export default rootReducer;