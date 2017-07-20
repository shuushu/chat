import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { firebaseConnect, pathToJS } from 'react-redux-firebase'

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
        }
    }

    logout = () => {
        this.props.firebase.logout().then(() => {
            this.setState({
                redirect: true
            })
        })
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
