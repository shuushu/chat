import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Login, RoomList, RoomView } from './index';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as memberAction from '../modules/Member';

import SocketIOClient from 'socket.io-client';

class App extends Component {
    // Creating the socket-client instance will automatically connect to the server.
    socket = SocketIOClient('http://localhost:3000');

    componentDidMount() {
        let _this = this;

        this.socket.on('init', (data) => {
            _this.props.memberAction.initialrize(data);
        });
    }

    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route path="/roomList" component={RoomList} />
                    <Route path="/roomView/:user" component={RoomView} />
                </Switch>
            </div>
        )
    }
}

export default connect(
    (state) => ({
        initData: state.member
    }),
    (dispatch) => ({
        memberAction: bindActionCreators(memberAction, dispatch)
    })
)(App);
