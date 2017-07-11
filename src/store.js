import { createStore, applyMiddleware, compose } from 'redux';
import modules from './modules';

import ReduxThunk from 'redux-thunk';
import penderMiddleware from 'redux-pender';

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
const store = createStore(modules, enhancer);



// 미들웨어가 여러개인경우에는 파라미터로 여러개를 전달해주면 됩니다. 예: applyMiddleware(a,b,c)
// 미들웨어의 순서는 여기서 전달한 파라미터의 순서대로 지정됩니다.
//const store = createStore(modules, applyMiddleware(loggerMiddleware))

export default store;