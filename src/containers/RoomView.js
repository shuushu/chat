import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
import {convertDate, convertTime, latestTime} from '../commonJS/Util';
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group';

@firebaseConnect((props) => {
    return [
        { path: 'room/' + props.rpath.match.params.user },
        { path: 'message/' + props.rpath.match.params.user },
        { path: 'joins/' + props.rpath.match.params.user },
    ]
})

@connect(
    ({ firebase }) => {
        return ({
            auth: pathToJS(firebase, 'auth'),
            profile: pathToJS(firebase, 'profile'),
            room: dataToJS(firebase, 'room'),
            message: dataToJS(firebase, 'message'),
            users: dataToJS(firebase, 'users'),
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
            size: 20,
            componentDidMount: true
        };

        this.savedNewDate = '';

        this.onScroll = this.onScroll.bind(this);
    }


    componentDidMount() {
        window.addEventListener('scroll', this.onScroll, true);

        let timer;
        let repeat = () => {
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
                            if(scrollTop >= clientHeight - screenHeight -200) {
                                let ROOM_KEY = that.props.rpath.match.params.user;

                                that.props.firebase.ref(`/message/${ROOM_KEY}/${snapshot.key}`).update({
                                        state: snapshot.val().state - 1
                                }, function(){});
                            }
                            that.setState({ hasNewMessage: true })
                        }
                    }
                });
            } else {
                timer = setTimeout(repeat, 1000);
            }
        };

        repeat();
    }

    componentWillReceiveProps ({ auth, room }) {
        if(room) {
            if(!room[this.props.rpath.match.params.user]) {
                window.location.href = '/roomList';
            }
        }

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
        const clientHeight = document.body.clientHeight;
        const screenHeight = window.screen.height;

        if ( scrollTop < 100) {
            // 이전 데이터 보여줌
            this.handleLoad();
        }

        if ( scrollTop >= clientHeight - screenHeight ){
            //console.clear();
        } else {

        }
    }

    // input TEXT
    handleChange = (e) => {
        this.setState({ latestMsg: e.target.value })
    };

    handleSubmit = (e) => {
        e.preventDefault();
        const KEY = this.props.rpath.match.params.user;

        if(this.state.latestMsg === '') {
            alert('메세지를 입력하세요');
            return false;
        }

        const currentTime = convertDate("yyyy-MM-dd HH:mm:ss");

        const message = {
            uid: this.props.auth.uid,
            nickName: this.props.profile.displayName,
            state: this.props.room[KEY].joins.length-1,
            sendMsg: this.state.latestMsg,
            avatarUrl: this.props.profile.avatarUrl,
            time: currentTime
        };

        let msg = this.props.message[KEY];
            msg = msg || [];
            msg.push(message);

        let that = this;

        this.props.firebase.ref(`/message/${KEY}`).update(msg, function(){
            window.scrollTo(0, document.body.scrollHeight);

            that.setState({
                latestMsg: '',
                size: that.state.size + 1
            });
        });
    };

    handleLoad = (e) => {
        if(e) {
            e.preventDefault();
        }

        let max = this.props.message[this.props.rpath.match.params.user].length;
        let current = (this.state.size + 10 >= max) ? max : this.state.size + 10;

        this.setState({ size: current });
    };

    render() {
        const scrollTop = window.scrollY;
        const clientHeight = document.body.clientHeight;
        const screenHeight = window.screen.height;

        if(this.state.redirect) {
            return (
                <Redirect to="/Login" />
            )
        }

        if(this.state.isEmpty) {
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

        let mapToList2 = (message) => {
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
                                    <img src={data.avatarUrl ? data.avatarUrl : 'http://placehold.it/40x40' } alt=""/>
                                </div>
                                <div className="profile">
                                    <div>
                                        <em>{data.nickName}</em> /
                                        <time dateTime={data.time}>{latestTime(data.time)}</time>
                                        <span className="state">{data.state}</span>
                                    </div>
                                    <p className="message">{data.sendMsg}</p>
                                </div>
                            </div>
                        </div>
                    )
                });
            }
        };

        // 새메세지가 왔을때
        let newMsgRender = () => {
            // 화면이 하단에 있을때
            if ( scrollTop >= clientHeight - screenHeight -200 ){
                setTimeout(() => {
                    this.setState({ hasNewMessage: false });
                }, 500);
                window.scrollTo(0, clientHeight);
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
                      <Link to="/roomList">뒤로</Link>
                      참여인원:
                      { this.state.roomViewData !== null && getMember() }
                  </div>
                  <hr/>
                  <div id="messages">
                      { this.props.message && mapToList2(this.props.message)}
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
