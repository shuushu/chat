import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/Root';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers/rootReducer';
import ReduxThunk from 'redux-thunk';
import penderMiddleware from 'redux-pender';
import registerServiceWorker from './registerServiceWorker';
/*
렌더링 될 때 Redux 컴포넌트인 <Provider> 에 store 를
설정해주면 그 하위 컴포넌트들에 따로 parent-child 구조로
전달해주지 않아도 connect 될 때 store에 접근 할 수 있게 해줍니다.
*/

const store = createStore(rootReducer , applyMiddleware(ReduxThunk, penderMiddleware));

ReactDOM.render(
    <Provider store={store} >
        <Root />
    </Provider>, document.getElementById('root'));
registerServiceWorker();
