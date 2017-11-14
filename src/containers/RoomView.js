import { mapValues, size, slice, lastIndexOf, last } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS, populatedDataToJS } from 'react-redux-firebase';
import {convertDate, convertTime, latestTime} from '../commonJS/Util';
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group';

const populate = { child: 'null', root: 'chat' }
let doch;

@firebaseConnect(
    () => {
        return ([
            { path: 'chat' , populates: [populate], queryParams: ['limitToFirst=5']} // places "goals" and "users" in redux , populates: [populate]
        ])
    }
)

@connect(
    ({ firebase }, props) => {
        let uid, user = props.firebase.auth().currentUser;

        if (user !== null) {
            uid = user.uid;
        }

        return ({
            auth: pathToJS(firebase, 'auth'),
            room: mapValues(dataToJS(firebase, 'chat/room/' + props.rpath.match.params.key), (value, key) => {
                if(key === 'message') {
                    let msg = dataToJS(firebase, 'chat/message/' + value, false);

                    if(!msg) { return false; }

                    msg.map((obj) => {
                        if(!obj) { return; }

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
            page: 20,
            componentDidMount: true,
            user: [],
            newMessgae: false
        };
        this.prevScrollTop = 0;
        this.nowScrollDirection = '';
        this.isOnAddMessage = false;
        this.newMessgae = false; // 새로운 메세지 확인 FLAG


        this.savedNewDate = '';
        this.onload = false;

        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll, true);
        this.onload = true;
    }

    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                redirect: true
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        // 룸 첫번째 렌더
        if(this.props.room.message && this.onload) {
            window.scrollTo(0, document.body.scrollHeight);
            this.onload = false;
        }

        if(this.props.room.message) {
            //console.log(last(this.props.room.message), last(nextProps.room.message.length))
            /*
            if(this.props.room.message.length !== nextProps.room.message.length) {
                let uid = last(nextProps.room.message).writer.providerData;

                if(this.props.auth.uid !== uid) {
                    if(window.scrollY <= document.body.clientHeight - window.screen.height) {
                        this.setState({newMessgae: true});
                    }
                } else {
                    window.scrollTo(0, document.body.scrollHeight);
                }
            }*/
        }
        return true;
    }

    componentDidUpdate() {

    }

    // 마운트해제
    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll, true);
    }

    onScroll() {
        const scrollTop = typeof window.pageYOffset !== 'undefined' ? window.pageYOffset: document.documentElement.scrollTop? document.documentElement.scrollTop: document.body.scrollTop? document.body.scrollTop:0;;
        const clientHeight = document.body.clientHeight;
        const screenHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;

        // 스크롤 방향 저장
        if (scrollTop > this.prevScrollTop) {
            this.nowScrollDirection = 'down';
        } else if (scrollTop < this.prevScrollTop) {
            this.nowScrollDirection = 'up';
        }

        this.prevScrollTop = scrollTop;

        // 스크롤 상단
        if ( scrollTop < 50 && this.nowScrollDirection === 'up' ){
            if (!this.isOnAddMessage) {
                let max = this.props.room.message.length;
                let current = (this.state.page + 10 >= max) ? max : this.state.page + 10;
                this.setState({ page: current });
                this.isOnAddMessage = true;
            }
        }

        // 스크롤 최하단
        if ( clientHeight <= (scrollTop + screenHeight) ){

        } else {

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
            state: size(this.props.room.join)-1,
            type: 0,
            text: this.state.latestMsg,
            date: currentTime
        };

        let data = {};
        let that = this;

        data[size(this.props.room.message)] = context;

        this.props.firebase.ref(`chat/message/${this.props.rpath.match.params.key}`).update(data, () => {
            that.setState({
                latestMsg: '',
                size: that.state.size + 1
            });

            if(that.props.room.roomState === 0) {
                that.props.room.join.forEach((key) => {
                    that.props.firebase.ref(`chat/room/${that.props.rpath.match.params.key}`).update({roomState: 1})
                });
            }

            this.isOnAddMessage = false;
        });
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
            let { providerData } = last(message).writer;
            let isScrollTop = false;

            if(window.scrollY >= document.body.clientHeight - window.screen.height) {
                if(providerData !== this.props.auth.uid) {
                    if(last(this.props.room.message).state > 0) {
                        this.props.firebase.ref(`chat/message/${this.props.rpath.match.params.key}/${message.length-1}`).update({state: last(this.props.room.message).state -1});
                    }
                }
                isScrollTop = false;
            } else {
                isScrollTop = true;
            }

            message = slice(message, message.length-this.state.page, message.length);

            let mapping = (message) => {
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
                                    [{key.state}] /
                                    <time dateTime={key.date}>{latestTime(key.date)}</time>
                                </div>
                                <p className="message">{key.text}</p>
                            </div>
                        </div>
                    );
                });
            };

            return (
                <div id="messages">
                    {mapping(message)}
                    {/*{console.log('isScrollTop ?', isScrollTop)}*/}
                    <ReactCSSTransitionGroup
                        component="div"
                        className="animated"
                        transitionName={{
                            enter: 'fadeIn',
                            leave: 'fadeOutDown'
                        }}
                        transitionEnterTimeout={3000}
                        transitionLeaveTimeout={1000}>
                        { last(message).state === 1 && (
                            <button className="animated message__unread fadeIn waves-effect waves-light btn">
                                N : {message.text}
                                <i className="material-icons right">new_releases</i>
                            </button>
                        )}
                    </ReactCSSTransitionGroup >
                </div>
            )







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
        let newMsgRender = (message) => {
            let scrollTop = window.scrollY;
            let screenHeight = window.screen.height;
            let clientHeight = document.body.clientHeight;

            let { providerData } = message.writer;

            if(providerData === this.props.auth.uid) {
                window.scrollTo(0, clientHeight);
                return false;
            }

            console.log(scrollTop >= clientHeight - screenHeight - 200)

            // 화면이 하단에 있을때
            if ( scrollTop >= clientHeight - screenHeight - 200 ){
                setTimeout(() => {

                }, 500);
                window.scrollTo(0, clientHeight);
            } else {
                // 화면이 상단에 있음
                setTimeout(() => {

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
                  <div>
                      { Array.isArray(this.props.room.message) && mapToList2(this.props.room.message)}
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