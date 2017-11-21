import { mapValues, size, isEmpty } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
import update from 'react-addons-update';

// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/roomList.css';

@firebaseConnect(
    () => {
        return ([
            { path: 'chat/room'},
        ])
    }
)

@connect(
    ({ firebase }) => {
        return ({
            auth: pathToJS(firebase, 'auth'),
            room: mapValues(dataToJS(firebase, 'chat/room'), (child) => {

                /*child['join'] = child.join.map((uid, i) => {
                    return dataToJS(firebase, 'chat/users/' + uid);
                });
*/

                return child;
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
        roomList: []
    };

    componentDidMount(){
        // SEARCH
        let ref = this.props.firebase.ref('chat/room');
        ref.orderByChild('join').on('value', (snapshot) => {
            let data = snapshot.val();
            let uid = this.props.auth.uid;
            let temp = [];

            for(let i in data) {
                let { join } = data[i];

                join.map((user) => {
                    if(user === uid) {
                        temp.push(this.props.room[i]);
                    }

                });
            }

            this.setState({
                roomList: temp
            }, () => {
                this.state.roomList.map(({join}) => {
                    let joinArr = [];

                    join.map((user) => {
                        let getUser = this.props.firebase.ref(`chat/users/${user}`);
                        // https://www.youtube.com/watch?v=l5bt79f4aHs
                        getUser.on('value', (userData) => {
                            this.setState({
                                roomList: update(this.state.roomList, {
                                    join: {$push: [222]}
                                })
                            });

                            joinArr.push(userData.val())
                        });
                    });

                    /*let ne = mapValues(this.state.roomList, (child) => {
                        console.log(joinArr)
                        child.join = joinArr;
                        return child
                    })*/


                    //this.state.roomList.join
                });
            });
        });

    }

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
                        return user.map((key, i) => {
                            let { displayName } = key;

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
                        return user.map((key, i) => {
                            let { avatarUrl, displayName } = key;

                            return (
                                <img key={`img${i}`} className={`i${i}`} src={avatarUrl} alt={displayName} />
                            )
                        });
                    };

                    return (
                        <li key={`li-${key}`} className="collection-item avatar">
                            <span className={`thumb circle cnt${join.length > 4 ? '4' : join.length }`}>{ getImage(join) }</span>
                            <Link to={`/roomView/${key}`}>
                                <span>idx : {index}</span>
                                <p>{this.props.message && getMessage(data[key].message)}</p>
                                <div className="joins">참여자 : { getMember(join) }</div>
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
                    {this.state.roomList.length > 0 ? mapToList(this.state.roomList) : <li>참여방 없음</li> }
                </ul>
            </div>
        );
    }
}

export default RoomList;
