import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS, isEmpty } from 'react-redux-firebase';
import update from 'react-addons-update';

import {convertDate} from '../commonJS/Util';

@firebaseConnect((props) => {
    return [
        { path: 'room/' + props.rpath.match.params.user },
        { path: 'message/' + props.rpath.match.params.user }
    ]
})

@connect(
    ({ firebase }) => {
        return ({
            auth: pathToJS(firebase, 'auth'),
            room: dataToJS(firebase, 'room'),
            message: dataToJS(firebase, 'message'),
        })
    }
)

class App extends Component {
    state = {
        redirect: false,
        ieEmpty: false,
        roomViewData: null,
        latestMsg: '',
        test: {
            msg: [2122]
        }
    };
    componentDidMount() {
        let timer;

        let repeat = () => {
            if(timer){
                clearTimeout(timer);
            }
            // firebase에 연결될때까지 요청
            if(this.props.room !== undefined) {
                // 요청되면 타이머 종료
                clearTimeout(timer);

                const PATH = this.props.rpath.match.params.user;

                this.props.socket.emit('joinroom',{
                    roomID: this.props.room[PATH].message
                });
            } else {
                timer = setTimeout(repeat, 1000);
            }
        };

        repeat();
    }



    componentWillReceiveProps ({ auth, room }) {
        if (auth === null) {
            this.setState({
                redirect: true
            })
        } else {
           /* // 한번만 실행됨
            if(this.props.roomView !== undefined) {
                let path = this.props.rpath.match.params.user;
                let joinArr = this.props.roomView[path].join;
                let flag = true;

                joinArr.map((joinEmail) => {
                    if( joinEmail === this.props.auth.email) {
                        flag = false;
                    }
                });
                // 첫방문시 join에 방문자 추가
                if(flag) {
                   this.props.firebase.set('room/' + this.props.rpath.match.params.user + '/join/' + joinArr.length, this.props.auth.email);
                }

                this.setState({
                    roomViewData: roomView[this.props.rpath.match.params.user]
                });
            }



            if(roomView !== undefined) {
                if(isEmpty(roomView[this.props.rpath.match.params.user])) {
                    this.setState({
                        ieEmpty: true
                    })
                } else {
                    this.props.socket.emit('joinroom',{
                        roomID: this.props.rpath.match.params.user,
                        user: auth
                     });
                }
            }*/
        }
    }

    // input TEXT
    handleChange = (e) => {
        this.setState({
            latestMsg: e.target.value
        })
    };

    handleSubmit = (e) => {
        e.preventDefault();

        if(this.state.latestMsg === '') {
            alert('메세지를 입력하세요');
            return false;
        }

        const currentTime = convertDate("yyyy-MM-dd HH:mm:ss");
        const message = Object.assign({
            user: this.props.auth.email,
            sendMsg: this.state.latestMsg,
            time: currentTime,
            seq: convertDate('yymmddhhmmss')
        });

        this.props.socket.emit('message', message);
    };

    render() {
        if(this.state.redirect) {
            return (
                <Redirect to="/Login" />
            )
        }

        if(this.state.ieEmpty) {
            alert('개설된 방이 없음');

            return (
                <Redirect to="/RoomList" />
            )
        }


        // Redux Props에서 state로 전달이 되면 실행
        let getMember = () => {
            let { join } = this.state.roomViewData;

            return join.map((email, idx) => {
                return (<span key={`room${idx}`} > ○ {email}</span>);
            });
        };

        let mapToList = (listData) => {
            if(listData !== null) {
                let msgData = listData.message;

                return msgData.map((data, idx) => {
                    // 메세지만 렌더링
                    if(typeof data !== 'object') {
                        return false;
                    }
                    // 채팅 입력시 현재 참여인원에게만 메세지를 보여준다
                    for(let i in data.listener) {
                        if(data.listener[i] === this.props.auth.email) {
                            return (
                                <div key={`key${idx}`} className={data.user === this.props.auth.email ? 'mine' : 'list'}>
                                    {listData.master === data.user && (<span>★</span>)}
                                    <em>{data.user}</em>
                                    / {data.sendMsg}
                                    <p>
                                        <strong>{data.time}</strong>
                                    </p>

                                </div>
                            );
                        }
                    }
                });
            }
        };

        let mapToList2 = (message) => {
console.log(message);
        }
        // {mapToList(this.state.roomViewData)}
        return (
              <div className="App">
                  <div>
                      참여인원:
                      { this.state.roomViewData !== null && getMember() }
                  </div>
                  <hr/>
                  <div id="messages">
                      { this.props.message && mapToList2(this.props.message)}
                  </div>

                  <div className="msgSendForm">
                      <form action="" onSubmit={this.handleSubmit}>
                            <input type="text" id="m"
                                   value={this.state.latestMsg}
                                   onChange={this.handleChange}
                            />
                            <button className="waves-effect waves-light btn" onClick={this.handleChangeMode} >
                                <i className="material-icons right">send</i>SEND
                            </button>
                      </form>
                  </div>
              </div>
        );
    }
}

export default App;
