import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase'
import SocketIOClient from 'socket.io-client';

@firebaseConnect([
    'room/RoomList'
])
@connect(
    ({ firebase }) => ({
        auth: pathToJS(firebase, 'auth'),
        todos: dataToJS(firebase, 'room/RoomList')
    })
)

class RoomList extends Component {
    state = {
        redirect: false
    };
    socket = SocketIOClient('http://localhost:3000');

    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                redirect: true
            })
        } else {
            this.socket.emit('joinroom',{user:auth.uid});
        }
    }

    logout = () => {
        this.props.firebase.logout();
        this.socket.on('connection', function(socket){
            socket.join('some room');
        });
    };

    handleAdd = (e) => {
        e.preventDefault();
        this.props.firebase.push('/room/RoomList',{
           roonName: '룸이름'
        });
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
                <div>
                    <div>
                        roomName : <input type="text"/>
                    </div>

                    <button onClick={this.handleAdd}>
                        CREATE ROOM
                    </button>
                </div>
            </div>
        );
    }
}

export default RoomList;
