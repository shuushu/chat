import { mapValues, size, indexOf } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS, populatedDataToJS, toJS, isLoaded, isEmpty } from 'react-redux-firebase';
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/roomList.css';

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
        //https://github.com/prescottprue/react-redux-firebase/blob/master/examples/snippets/stateBasedQuery/App.js#L53-L75
        const { auth } = this.props
        if (!isLoaded(auth)) {
            return <div>Loading...</div>
        }

        if (isEmpty(auth)) {
            return <Redirect to="/Login" />
        }




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
                            let { displayName } = this.props.users[key];

                            return (
                                <span key={`displayName${i}`}>{displayName}</span>
                            )
                        });
                    };

                    let getImage = (user) => {
                        return user.map((key, i) => {
                            let { avatarUrl, displayName } = this.props.users[key];

                            return (
                                <img key={`img${i}`} className={`i${i}`} src={avatarUrl} alt={displayName} />
                            )
                        });
                    };

                    let getMessage = (message) => {
                        if(this.props.message[message]) {
                            let {text} = this.props.message[message];

                            return text
                        }
                    };

                    return (
                        <li key={`li-${key}`} className="collection-item avatar">
                            {/*<span className={`thumb circle cnt${join.length > 4 ? '4' : join.length }`}>{ this.props.users && getImage(join) }</span>*/}
                            <Link to={`/roomView/${key}`}>
                                <span>idx : {index}</span>
                                {/*<div className="joins">참여자 : { this.props.users && getMember(join) }</div>*/}
                                <div>{ size(this.props.message) > 0 && getMessage(message) }</div>
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
                <button>add PAGE</button>
            </div>
        );
    }
}

//export default RoomList;
const populate = {child: 'users', root: 'chat' };
const populateMSG = { child: 'message', root: 'chat' };
let temp = [];
const fbWrapped = firebaseConnect(
    (props) => {
        let arr = [
            { path: ['chat/users/JMQZWDDVs2ZfmPaWdPkUaYnCUhM2', 'chat/users/epDoQ5vU7DXAwnwgxFu8OaVGo3D2']},
        ];

        if(props.auth) {
            arr[1] = { path: 'chat/room', storeAs: 'rooms', queryParams: ['orderByChild=master', `equalTo=${props.auth.uid}`]};

            if(size(props.room) > 0) {
                for(let i in props.room) {
                    /*props.room[i].join.map((key) => {
                        if(indexOf(temp, key) < 0) {
                            temp.push(key);

                        }
                        arr[arr.length] = { path: 'chat/users/' + key, populate: [populate] }
                    });
*/
                    arr[arr.length] = { path: 'chat/message/' + i,  queryParams: ['limitToLast=1'], populates: [populateMSG]}
                }
            }
            //console.log(props.room)

            return (arr);
        }
    }
)(RoomList);

export default connect(
    ({ firebase }) => {
        return ({
            room: mapValues(dataToJS(firebase, 'rooms'), (child) => {
                let userArr = dataToJS(firebase, 'chat/users');
                console.log(userArr)

                /*if(userArr) {
                    child.join.forEach((key, i) => {
                        child.join[i] = userArr[key];
                    });
                }*/
                return child
            }),
            message: mapValues(dataToJS(firebase, 'chat/message'), (child) => {
                for(let i in child) {
                    child = child[i];
                }
                return child;
            }),
            auth: pathToJS(firebase, 'auth')
        })
    }
)(fbWrapped)