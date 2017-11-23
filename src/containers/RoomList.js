import { mapValues, size, isEmpty } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS, populatedDataToJS } from 'react-redux-firebase';
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/roomList.css';

const populates = [
    { child: 'join', root: 'chat/users', keyProp: 'key'}
]

@firebaseConnect(
    () => {
        return ([
            { path: 'chat/room/', queryParams: [ 'orderByKey' ], populates },
        ])
    }
)

@connect(
    ({ firebase }) => {
        return ({
            auth: pathToJS(firebase, 'auth'),
            room: mapValues(populatedDataToJS(firebase, 'chat/room',  populates), (child)=>{
                if(child !== null) {
                    for(let i in child.join){
                        if(child.join[i].key === firebase.getIn(['auth']).uid) {
                            return child
                        }
                    }
                }
            })
        })
    }
)


class RoomList extends Component {
    state = {
        isLogin: false,
        isCreate: {
            created: false,
            url: null
        },
        latestMsg: '',
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
        if(this.props.auth.uid === this.props.room[key].master){
            let msgID = this.props.room[key].message;
            this.props.firebase.remove('/room/' + key).then(()=>{
                this.props.firebase.remove('/message/' + msgID)
            });
        } else {
            alert('권한이 없습니다.');
            return false;
        }
    };

    shouldComponentUpdate(nextProps) {
        return (JSON.stringify(nextProps) !== JSON.stringify(this.props));
    }

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

        let roomCnt = 0;

        let mapToList = (data) => {
            if(!isEmpty(data)) {
                return Object.keys(data).map((key, index) => {

                    if(size(data[key]) < 1){
                        return false;
                    }

                    let { join, message, roomState } = data[key];

                    // roomState 0 비활성화
                    if(roomState <= 0) {
                        ++ roomCnt;
                        if(roomCnt <= 0) {
                            return (<li>참여방 없음</li>);
                        }
                        return;
                    }

                    let getMember = (user) => {
                        return Object.keys(user).map((key, i) => {
                            let { displayName } = user[key];

                            return (
                                <span key={`displayName${i}`}>{displayName}</span>
                            )
                        });
                    };

                    let getMessage = (data) => {
                        let msg = this.props.message[data];

                        if(msg) {
                            return(
                                <strong>{msg[msg.length-1].sendMsg}</strong>
                            )
                        }
                    };

                    let getImage = (user) => {
                        return Object.keys(user).map((key, i) => {
                            let { avatarUrl, displayName } = user[key];

                            return (
                                <img key={`img${i}`} className={`i${i}`} src={avatarUrl} alt={displayName} />
                            )
                        });
                    };

                    return (
                        <li key={`li-${key}`} className="collection-item avatar">
                            <span className={`thumb circle cnt${size(join) > 4 ? '4' : size(join) }`}>{ size(join) > 0 && getImage(join) }</span>
                            <Link to={`/roomView/${key}`}>
                                <span>idx : {index}</span>
                                <p>{this.props.message && getMessage(data[key].message)}</p>
                                <div className="joins">참여자 : { size(join) > 0 && getMember(join) }</div>
                                <div>{ message && message.text }</div>
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
                    {this.props.room ? mapToList(this.props.room) : <li>참여방 없음</li> }
                </ul>
            </div>
        );
    }
}

export default RoomList;
