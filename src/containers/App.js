import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Login, RoomList, RoomView } from './index';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as counterActions from '../modules/Counter';

import SocketIOClient from 'socket.io-client';

class App extends Component {
    // Creating the socket-client instance will automatically connect to the server.
    socket = SocketIOClient('http://localhost:3000');

    componentDidMount() {
        let _this = this;
        //_this.props.CounterActions.increment()
        /*this.socket.on('init', (data) => {

        });*/
    }    

    render() {
        const { CounterActions, number } = this.props;

        return (
            <div>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route path="/roomList" component={RoomList} />
                    <Route path="/roomView/:user" component={RoomView} />
                </Switch>
                <h1>{number}</h1>
                <button onClick={CounterActions.increment}>+</button>
            </div>
        )
    }
}

export default connect(
    (state) => ({
        number: state.counter,
        post: state.post.data,
        loading: state.pender.pending['GET_POST'],
        error: state.pender.failure['GET_POST']
    }),
    (dispatch) => ({
        CounterActions: bindActionCreators(counterActions, dispatch)
    })
)(App);
