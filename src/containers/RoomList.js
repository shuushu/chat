import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/roomList.css';

@firebaseConnect([
    'room'
])
@connect(
    ({ firebase }) => ({
        profile: pathToJS(firebase, 'profile'),
        room: dataToJS(firebase, 'room')
    })
)

class RoomList extends Component {
    state = {
        isLogin: false,
        isCreate: {
            created: false,
            url: null
        },
        latestMsg: ''
    };

    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                isLogin: true
            })
        }
    }

    logout = () => {
        this.props.firebase.logout();
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

    render() {
        if(this.state.isLogin) {
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
            if(this.props.profile !== undefined) {
                let mail = this.props.profile.email;

                return Object.keys(data).map((key, index) => {
                    console.log();

                    if(mail === data[key].master.email) {
                        let getMember = (user) => {
                            return Object.keys(user).map((key, index) => {
                                return <span key={`user_${key}`}>{user[key].displayName}</span>
                            });
                        };

                        return (
                            <li key={key} className="collection-item avatar">
                                <img src={data[key].master.avatarUrl} className="circle" alt={data[key].master.displayName} />
                                <Link to={`/roomView/${key}`}>
                                    <span>idx : {index}</span>
                                    <h5>방이름 / {data[key].roomName}</h5>
                                    <div>
                                        <p>방장 / {data[key].master.displayName}</p>
                                        <p>참여인원 / {getMember(data[key].joins)}</p>
                                    </div>
                                </Link>
                                <a className="btn-floating btn-large waves-effect waves-light blue" >
                                    <i className="large material-icons" onClick={() => {this.handleDelete(key)}}>delete</i>
                                </a>
                            </li>
                        );
                    }
                });
            }
        };

        return (
            <div>
                <nav>
                    <div className="nav-wrapper">
                        <a href="#!" className="brand-logo">ROOM LIST</a>
                        <ul className="right hide-on-med-and-down">
                            <li><a href="sass.html"><i className="material-icons left">search</i>Link with Left Icon</a></li>
                            <li><a href="#" onClick={this.logout}><i className="material-icons right">view_module</i>logout</a></li>
                        </ul>
                    </div>
                </nav>

                <ul className="collection">
                    {this.props.room !== undefined && mapToList(this.props.room)}
                </ul>
            </div>
        );
    }
}

export default RoomList;
