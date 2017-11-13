import { mapValues, size, slice, lastIndexOf, last } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS, populatedDataToJS } from 'react-redux-firebase';
import {convertDate, convertTime, latestTime} from '../commonJS/Util';
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group';

const populate = { child: 'null', root: 'chat' }

@firebaseConnect(
    () => {
        return ([
            { path: 'chat' , populates: [populate], queryParams: ['limitToFirst=5']} // places "goals" and "users" in redux , populates: [populate]
        ])
    }
)

@connect(
    ({ firebase }, props) => {
        return ({
            auth: pathToJS(firebase, 'auth'),
            room: mapValues(dataToJS(firebase, 'chat/room/' + props.rpath.match.params.key), (value, key) => {
                if(key === 'message') {
                     let msg = dataToJS(firebase, 'chat/message/' + value, false);

                     if(!msg) {
                         return false;
                     }

                     msg.map((obj) => {
                         let UID = obj.writer;

                         obj.writer = mapValues(dataToJS(firebase, 'chat/users/' + obj.writer), (value, key) => {
                             if(key === 'providerData') {
                                 value = UID;
                             }
                             return value;
                         });
                     });

                    value = msg;
                }
                return value;
            }),
        })
    }
)


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            isEmpty: false,
            roomViewData: null,
            latestMsg: '',
            hasNewMessage: false,
            page: 10,
            componentDidMount: true,
            user: []
        };

        this.savedNewDate = '';
        this.screenHeight = 0;
        this.clientHeight = 0;

        this.onScroll = this.onScroll.bind(this);
    }


    componentDidMount() {
        this.clientHeight = document.body.clientHeight;
        this.screenHeight = window.screen.height;

        window.addEventListener('scroll', this.onScroll, true);

        setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
        }, 3000);

        let timer;
        /*let repeat = () => {
            if(timer){
                clearTimeout(timer);
            }
            // firebase에 연결될때까지 요청
            if(this.props.message) {
                // 요청되면 타이머 종료
                clearTimeout(timer);

                let that = this;
                let msgSize = (this.props.message[that.props.rpath.match.params.user]) ? this.props.message[that.props.rpath.match.params.user].length-1 : 0;

                this.props.firebase.ref('/message/' + this.props.rpath.match.params.user).limitToLast(1).on("child_added", function(snapshot) {
                    // 컴포넌트 렌더링 이후 메세지 수신이 있으면 실행
                    if(msgSize !== Number(snapshot.key)) {
                        if(snapshot.val().uid !== that.props.auth.uid) {
                            const scrollTop = window.scrollY;
                            const clientHeight = document.body.clientHeight;
                            const screenHeight = window.screen.height;
                            // 읽음 표시상태 로직
                            //if(scrollTop >= clientHeight - screenHeight -200) {
                                let ROOM_KEY = that.props.rpath.match.params.user;

                                that.props.firebase.ref(`/message/${ROOM_KEY}/${snapshot.key}`).update({
                                        state: snapshot.val().state - 1
                                }, function(){});
                            //}
                            that.setState({ hasNewMessage: true })
                        }
                    }
                });
            } else {
                timer = setTimeout(repeat, 1000);
            }
        };

        repeat();*/
    }

    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                redirect: true
            })
        }
    }
    // 마운트해제
    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll, true);
    }
    

    onScroll() {
        const scrollTop = window.scrollY;

        if ( scrollTop === 0) {
            // 이전 데이터 보여줌
            this.handleLoad();
        }

        if ( scrollTop >= this.clientHeight - this.screenHeight ){
            //console.clear();
        }
    }

    // input TEXT
    handleChange = (e) => {
        this.setState({ latestMsg: e.target.value })
    };

    handleSubmit = (e) => {
        e.preventDefault();

        if(this.state.latestMsg === '') {
            alert('메세지를 입력하세요');
            return false;
        }

        const currentTime = convertDate("yyyy-MM-dd HH:mm:ss");
        const context = {
            writer: this.props.auth.uid,
            state: 0,
            type: 0,
            text: this.state.latestMsg,
            date: currentTime
        };

        let data = {};
        let that = this;

        data[size(this.props.room.message)] = context;

        this.props.firebase.ref(`chat/message/${this.props.rpath.match.params.key}`).update(data, () => {
            //window.scrollTo(0, document.body.scrollHeight);
            that.setState({
                latestMsg: '',
                size: that.state.size + 1
            });

            if(that.props.room.roomState === 0) {
                that.props.room.join.forEach((key) => {
                    that.props.firebase.ref(`chat/room/${that.props.rpath.match.params.key}`).update({roomState: 1})
                });
            };

            that.setState({ hasNewMessage: true })
        });
    };

    handleLoad = (e) => {
        let max = this.props.room.message.length;
        let current = (this.state.page + 10 >= max) ? max : this.state.page + 10;
console.log(current);
        this.setState({ page: current });
    };

    render() {
        if(this.state.redirect) {
            return (
                <Redirect to="/Login" />
            )
        }

        if(this.state.isEmpty) {
            alert('개설된 방이 없음');

            return (
                <Redirect to={`/Login`} />
            )
        }

        // Redux Props에서 state로 전달이 되면 실행
        let getMember = () => {
            let { join } = this.state.roomViewData;

            return join.map((email, idx) => {
                return (<span key={`room${idx}`} > ○ {email}</span>);
            });
        };

        let mapToList2 = (message) => {
            message = slice(message, message.length-this.state.page, message.length);

            return message.map((key, i) => {
                let { avatarUrl, displayName } = key.writer;

                return (
                    <div key={`itemMSG${i}`} className={key.writer.providerData === this.props.auth.uid ? 'mine' : 'list'}>
                        <div className="imgs">
                            {<img src={ avatarUrl ? avatarUrl : 'http://placehold.it/40x40' } alt=""/>}
                        </div>
                        <div className="profile">
                            <div>
                                <em>{ displayName }</em> /
                                <time dateTime={key.date}>{latestTime(key.date)}</time>
                            </div>
                            <p className="message">{key.text}</p>
                        </div>
                    </div>
                );
            });



/*
            let key = this.props.rpath.match.params.user;
            let currentHeight = document.body.scrollHeight;
            let isNewDate = '';

            if(message[key]) {
                let msgData = message[key];

                return msgData.map((data,i) => {

                    if(i < msgData.length - this.state.size) {
                        return false;
                    }
                    // 마지막메세지
                    if(i >= msgData.length-1) {
                        if(this.state.componentDidMount) {
                            window.scrollTo(0, currentHeight);

                            setTimeout(() => {
                                this.setState({ componentDidMount: false })
                            }, 1000);
                        }
                    }

                    // convert TIME
                    let getDate = convertTime(data.time);

                    if (this.savedNewDate === getDate) {
                        isNewDate = false;
                    } else {
                        isNewDate = true;
                        this.savedNewDate = getDate;
                    }

                    return (
                        <div key={`itemMSG${i}`} >
                            {isNewDate && (
                                <div className="division">
                                    <span className="text">{getDate}</span>
                                </div>
                            )}
                            <div className={data.uid === this.props.auth.uid ? 'mine' : 'list'}>

                                <div className="imgs">
                                    {<img src={ this.props.users ? this.props.users[data.uid].avatarUrl : 'http://placehold.it/40x40' } alt=""/>}
                                </div>
                                <div className="profile">
                                    <div>
                                        <em>{ this.props.users && this.props.users[data.uid].displayName }</em> /
                                        <time dateTime={data.time}>{latestTime(data.time)}</time>
                                        {data.state > 0 && (
                                            <span className="state">{data.state}</span>
                                        )}
                                    </div>
                                    <p className="message">{data.sendMsg}</p>
                                </div>
                            </div>
                        </div>
                    )
                });
            }*/
        };

        // 새메세지가 왔을때
        let newMsgRender = () => {
            let scrollTop = window.scrollY;
            this.clientHeight = document.body.clientHeight;

            let { providerData } = last(this.props.room.message).writer;

            if(providerData === this.props.auth.uid) {
                window.scrollTo(0, this.clientHeight);
                return false;
            }


            // 화면이 하단에 있을때
            if ( scrollTop >= this.clientHeight - this.screenHeight - 200 ){
                setTimeout(() => {
                    this.setState({ hasNewMessage: false });
                }, 500);
                window.scrollTo(0, this.clientHeight);
            } else {
                // 화면이 상단에 있음
                setTimeout(() => {
                    this.setState({ hasNewMessage: false });
                }, 2000);

                return (
                    <button className="animated message__unread fadeIn waves-effect waves-light btn">
                        새 메시지가 있습니다.
                        <i className="material-icons right">new_releases</i>
                    </button>
                );
            }
        };

        return (
              <div className="App">
                  <div>
                      <Link to={`/RoomList`}>뒤로</Link>
                      참여인원:
                      { this.state.roomViewData !== null && getMember() }
                  </div>
                  <hr/>
                  <div id="messages">
                      { Array.isArray(this.props.room.message) && mapToList2(this.props.room.message)}
                  </div>

                  <ReactCSSTransitionGroup
                      component="div"
                      className="animated"
                      transitionName={{
                          enter: 'fadeIn',
                          leave: 'fadeOutDown'
                      }}
                      transitionEnterTimeout={3000}
                      transitionLeaveTimeout={1000}>
                      {this.state.hasNewMessage && newMsgRender()}
                  </ReactCSSTransitionGroup >

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