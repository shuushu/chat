import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS } from 'react-redux-firebase'
import SocketIOClient from 'socket.io-client';

@firebaseConnect()
@connect(
    ({ firebase }) => ({
        auth : pathToJS(firebase, 'auth')
    })
)

class RoomList extends Component {
    state = {
        redirect: false
    };


    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                redirect: true
            })
        } else {
            let socket = SocketIOClient('http://localhost:3000');
        }
    }

    logout = () => {
        this.props.firebase.logout();
    };

    render() {
        if(this.state.redirect) {
            return (
                <Redirect to="/Login" />
            )
        }

        return (
            <div>
                ROOM LIST
                <button onClick={this.logout}>LOGOUT</button>
            </div>
        );
    }
}

export default RoomList;
