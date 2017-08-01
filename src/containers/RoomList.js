import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';

@firebaseConnect([
    'roomList'
])
@connect(
    ({ firebase }) => ({
        auth: pathToJS(firebase, 'auth'),
        roomList: dataToJS(firebase, 'roomList')
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
            //this.socket.emit('joinroom',{user:auth.uid});
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

        let mapToList = (data) => {
            if(data !== undefined) {
                return Object.keys(data).map((key, index) => {
                    return (
                        <li key={key}>
                            <Link to={`/roomView/${key}`}>
                                <span>idx : {index}</span>
                                <h5>방이름 / {data[key].roomName}</h5>
                                <p>ID / {data[key].masterID}</p>
                                <p>방장 / {data[key].masterName}</p>
                            </Link>
                        </li>
                    );
                });
            }
        };


        return (
            <div>
                ROOM LIST
                <button onClick={this.logout}>LOGOUT</button>
                <ul>
                    {mapToList(this.props.roomList)}
                </ul>
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
