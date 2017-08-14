import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';

@firebaseConnect([
    'room'
])
@connect(
    ({ firebase }) => ({
        auth: pathToJS(firebase, 'auth'),
        roomList: dataToJS(firebase, 'room')
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
    componentDidMount() {
        console.log(this.state)
    }

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

        // 룸정보 저장
        let roomID = this.props.firebase.push('/room', {
            roomName: this.state.latestMsg,
            master: this.props.auth.email
        }).key;

        // join 테이블 저장
        this.props.firebase.push('/join', {
            roomID: roomID,
            user: this.props.firebase.auth().currentUser.uid,
            fav : true,
            alarm: true
        });

        /* 검색
        this.props.firebase.ref('/join').on('value', (snapshot) => {
            let data = snapshot.val();

            if(data === null) {
                data = {}
            }

            data[roomID] = {
                fav : true,
                alarm: true
            };

            console.log(data);
        });*/

        //console.log(roomID);
    };
    // 방 삭제
    handleDelete = (key) => {
        if(this.props.auth.email === this.props.roomList[key].master){
            this.props.firebase.remove('/rooms/' + key);
        } else {
            alert('권한이 없습니다.');
            return false;
        }
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
            if(data !== null) {
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
                    {this.props.roomList !== undefined && mapToList(this.props.roomList)}
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
