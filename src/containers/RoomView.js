import { size, last, mapValues, sortBy } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect,  } from 'react-redux';
import { compose } from 'redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS, populatedDataToJS } from 'react-redux-firebase';
import {convertDate, convertTime, latestTime} from '../commonJS/Util';
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group';

const populates = [  { child: 'join', root: 'chat/users', keyProp: 'key'} ];

let page = 10;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            isEmpty: false,
            latestMsg: '',
            page: 20,
            msg: '',
            newMessgae: false // 메세지 알림 flag
        };
        this.prevScrollTop = 0;
        this.nowScrollDirection = '';
        this.isOnAddMessage = false;


        this.onScroll = this.onScroll.bind(this);
        this.addMessage = this.addMessage.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll, true);
    }

    componentWillReceiveProps({ message, auth }){
        // 로그인 여부
        if (!auth) {
            this.setState({ redirect: true });
        }

        this.setState({
            msg: message
        })
    }

    componentWillUpdate(props, state) {

    }

    componentDidUpdate(prevProps, prevState) {
        // 첫렌더링 && 새로고침 - 스크롤 이동 - 렌더링 된 후
        if(this.state.msg.length-prevState.msg.length === this.state.msg.length) {
            window.scrollTo(0, document.body.scrollHeight);
        }


        if(size(prevState.msg) > 0 && size(this.state.msg) > 0) {
            let newmsg = last(this.state.msg);
            let oldmsg = last(prevState.msg);

            // 새로운 메세지 수신
            if(newmsg.seq !== oldmsg.seq) {
                if(newmsg.writer === this.props.auth.uid) {
                    window.scrollTo(0, document.body.scrollHeight);
                } else {
                    // 상대방
                    if(window.scrollY <= document.body.clientHeight - window.screen.height) {
                        this.setState({ newMessgae: false })
                    } else {
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                }
            }
        }

    }

    // 마운트해제
    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll, true);

        page = 10;
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

    addMessage = (e) => {
        if(e) e.preventDefault();

        page = page + 1;

        let data = this.props.firebase.ref('chat/message/' + this.props.rpath.match.params.key).limitToLast(page);

        data.on('value', (snap) => {
            /*if(tempMsg.length > size(sortBy(snap.val(), [(o) => { return o.seq }]))) {
                return false;
            }*/

            this.setState({
                msg: sortBy(snap.val(), [(o) => {
                    return o.seq
                }])
            }, () => {
                /*if(tempMsg.length <= this.state.msg.length) {
                    tempMsg = this.state.msg;
                }*/
            });
        });
    };

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
            seq: convertDate("yyyyMMddHHmmss"),
            state: size(this.props.room.join)-1,
            type: 0,
            text: this.state.latestMsg,
            date: currentTime
        };

        let that = this;

        this.props.firebase.ref(`chat/message/${this.props.rpath.match.params.key}`).push(context, () => {
            that.setState({
                latestMsg: ''
            });

            if(that.props.room.roomState === 0) {
                that.props.firebase.ref(`chat/room/${that.props.rpath.match.params.key}`).update({roomState: 1})
            }

            that.props.firebase.ref(`chat/room/${that.props.rpath.match.params.key}`).update({message: context})

            this.isOnAddMessage = false;
        });
    };

    render() {
        if(this.state.redirect) {
            return (
                <Redirect to="/Login" />
            )
        }

        /*if(this.state.isEmpty) {
            alert('개설된 방이 없음');

            return (
                <Redirect to={`/Login`} />
            )
        }*/



        let mapToList2 = (message) => {
            let getUserInfo = (writer, prop) => {
                for(let i in this.props.room.join) {
                    if(writer === this.props.room.join[i].key) {
                        return this.props.room.join[i][prop]
                    }
                }
            };

            let mapping = (data) => {
                return data.map((key, i) => {
                    let { date, text, state, writer} = key;

                    return (
                        <div key={`itemMSG${i}`} className={writer === this.props.auth.uid ? 'mine' : 'list'}>
                            <div className="imgs">
                                {/*<img src={ getUserInfo(writer, 'avatarUrl') ? getUserInfo(writer, 'avatarUrl') : 'http://placehold.it/40x40' } alt="" />*/}
                            </div>
                            <div className="profile">
                                <div>
                                    22
                                    {/*{ getUserInfo(writer, 'displayName') }*/}
                                    {/*[{state}] /*/}
                                    {/*<time dateTime={date}>{latestTime(date)}</time>*/}
                                </div>
                                <p className="message">{text}</p>
                            </div>
                        </div>
                    );
                });
            };

            let newMessage = (type, isNewMsg) => {
                if(type === 1 && isNewMsg) {
                    return (
                        <button className="animated message__unread fadeIn waves-effect waves-light btn">
                            N : {last(message).text}
                            <i className="material-icons right">new_releases</i>
                        </button>
                    )
                }
            };

            return (
                <div id="messages">
                    {mapping(message)}
                    <ReactCSSTransitionGroup
                        component="div"
                        className="animated"
                        transitionName={{
                            enter: 'fadeIn',
                            leave: 'fadeOutDown'
                        }}
                        transitionEnterTimeout={3000}
                        transitionLeaveTimeout={1000}>
                        { newMessage(last(message).state, this.state.newMessgae) }
                    </ReactCSSTransitionGroup >
                </div>
            )
        };

        return (
              <div className="App">
                  <div>
                      <Link to={`/RoomList`}>뒤로</Link>
                      참여인원:
                      <button onClick={this.addMessage}>add message</button>
                  </div>
                  <hr/>
                  <div>
                      { size(this.state.msg) > 0 && mapToList2(this.state.msg) }
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

export default compose(
    connect(
        ({ firebase }) => {
            return ({
                auth: pathToJS(firebase, 'auth'),
                room: populatedDataToJS(firebase, 'myRoom', populates),
                message: sortBy(dataToJS(firebase, 'message'),[(o) => {
                    return o.seq
                }]),
            })
        }
    ),
    firebaseConnect(
        ({rpath, message}) => {
            console.log('firebaseConnect', page)
            return ([
                { path: 'chat/room/'  + rpath.match.params.key, storeAs: 'myRoom', populates},
                { path: 'chat/message/' + rpath.match.params.key, storeAs: 'message', queryParams: ['limitToLast=' + page] },
            ])
        }
    )
)(App)