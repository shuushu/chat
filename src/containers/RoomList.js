import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';

@firebaseConnect([
    'rooms'
])
@connect(
    ({ firebase }) => ({
        auth: pathToJS(firebase, 'auth'),
        roomList: dataToJS(firebase, 'rooms')
    })
)

class RoomList extends Component {
    state = {
        redirect: false,
        isCreate: {
            created: false,
            url: null
        },
        latestMsg: ''
    };

    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                redirect: true
            })
        }
    }

    logout = () => {
        this.props.firebase.logout();
    };

    // 방 만들기
    handleAdd = (e) => {
        e.preventDefault();

        this.props.firebase.push('/rooms',{
            roomName: this.state.latestMsg,
            master: this.props.auth.email,
            join: [ ],
            message: 0
        }).then((data)=>{
            this.setState({
                latestMsg: '',
                isCreate: {
                    created: true,
                    url: data.path.o[1]
                }
            });
        });
    };
    // 방 삭제
    handleDelete = (key) => {
        this.props.firebase.remove('/rooms/' + key);
    };

    // input TEXT
    handleChange = (e) => {
        this.setState({
            latestMsg: e.target.value
        })
    };

    render() {
        if(this.state.redirect) {
            return (
                <Redirect to="/Login" />
            )
        }
        if(this.state.isCreate.created) {
            return (
                <Redirect to={`/roomView/${this.state.isCreate.url}`} />
            )
        }

        let mapToList = (data) => {
            if(data !== undefined) {
                return Object.keys(data).map((key, index) => {
                    if(data[key] === null) {
                        return false;
                    }
                    return (
                        <li key={key}>
                            <Link to={`/roomView/${key}`}>
                                <span>idx : {index}</span>
                                <h5>방이름 / {data[key].roomName}</h5>
                                <p>방장 / {data[key].master}</p>
                            </Link>
                            <a className="btn-floating btn-large waves-effect waves-light blue" >
                                <i className="large material-icons" onClick={() => {this.handleDelete(key)}}>delete</i>
                            </a>
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
                        roomName :
                        <input type="text"
                               value={this.state.latestMsg}
                               onChange={this.handleChange}
                        />
                    </div>
                    <button className="waves-effect waves-light btn" onClick={this.handleAdd} >
                        <i className="material-icons right">add</i>CREATE ROOM
                    </button>
                </div>
            </div>
        );
    }
}

export default RoomList;
