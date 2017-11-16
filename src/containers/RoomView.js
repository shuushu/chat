import { mapValues, size, slice, lastIndexOf, last, reduce, sortBy } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS, populatedDataToJS } from 'react-redux-firebase';
import {convertDate, convertTime, latestTime} from '../commonJS/Util';
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group';

const populate = { child: 'users', root: 'chat' };
let page = 122;

@firebaseConnect(
    ({rpath}) => {
        return ([
            { path: 'chat/users', populates: [populate]},
            { path: 'chat/room/'  + rpath.match.params.key},
            { path: 'chat/room/'  + rpath.match.params.key +'/join', populates: [populate]},
            { path: 'chat/message/' + rpath.match.params.key, storeAs: 'message', queryParams: ['limitToLast=' + page] },
        ])
    }
)

@connect(
    ({ firebase }, props) => {
        return ({
            auth: pathToJS(firebase, 'auth'),
            room: dataToJS(firebase, 'chat/room/' + props.rpath.match.params.key),
            message: sortBy(dataToJS(firebase, 'message'), [(o) => {
                return o.seq
            }]),
            member: reduce(dataToJS(firebase, 'chat/room/'  + props.rpath.match.params.key +'/join'), (v1,v2) => {
                let obj = {};
                obj[v1] = dataToJS(firebase, 'chat/users/' + v1);
                obj[v2] =dataToJS(firebase, 'chat/users/' + v2);

                return obj;
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
            msg: '',
            newMessgae: false
        };
        this.prevScrollTop = 0;
        this.nowScrollDirection = '';
        this.isOnAddMessage = false;
        this.newMessgae = false; // 새로운 메세지 확인 FLAG


        this.savedNewDate = '';
        this.isMapping = false; // 첫 메세지 맵핑
        this.onload = false;  // 룸 첫번째 렌더

        this.onScroll = this.onScroll.bind(this);
        this.addMessage = this.addMessage.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll, true);

        this.isMapping = true;
    }

    componentWillReceiveProps({ message, auth }){
        // props > state로 메세지 지정
        if(message.length > 0 && this.isMapping){
            this.setState({
                msg: message
            });
            this.isMapping = false;
        }

        // 로그인 여부
        if (!auth) {
            this.setState({ redirect: true });
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        /*if(this.props.message === nextProps.message && this.state.latestMsg === nextState.latestMsg){
            return false;
        }*/



        // 룸 첫번째 렌더-셋타임아웃 다른 방법은?
        if(nextState.msg.length - this.state.msg.length === nextState.msg.length && nextState.msg.length > 0) {
            setTimeout(()=>{
                window.scrollTo(0, document.body.scrollHeight);
            }, 1000);

            this.onload = false;
        }


        /*if(this.state.msg) {
            if(this.state.msg.length !== nextProps.state.msg.length) {

                let uid = last(nextProps.message).writer.providerData;

                if(this.props.auth.uid !== uid) {
                    if(window.scrollY <= document.body.clientHeight - window.screen.height) {
                        this.newMessgae = true;
                    }
                } else {
                    window.scrollTo(0, document.body.scrollHeight);
                }
                this.setState({newMessgae: true});
            }
        }*/
        return true;
    }

    componentDidUpdate(prevProps) {
        // 메세지 송수신
        if(size(this.props.message) - size(prevProps.message) === 1) {
            if(last(prevProps.message).writer === this.props.auth.uid) {
                window.scrollTo(0, document.body.scrollHeight);
            } else {
                if(window.scrollY <= document.body.clientHeight - window.screen.height) {
                    this.newMessgae = true;
                } else {
                    window.scrollTo(0, document.body.scrollHeight);
                }
            }
        }
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

    addMessage = (e) => {
        if(e) e.preventDefault();

        page++;
        let data = this.props.firebase.ref('chat/message/' + this.props.rpath.match.params.key).limitToLast(page);

        data.on('value', (snap) => {
            this.setState({
                msg: sortBy(snap.val(), [(o) => {
                    return o.seq
                }])
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

        let data = {};
        let that = this;


        this.props.firebase.ref(`chat/message/${this.props.rpath.match.params.key}`).push(context, () => {
            that.setState({
                latestMsg: '',
                size: that.state.size + 1
            });
            this.addMessage();

            /*if(that.props.room.roomState === 0) {
                that.props.room.join.forEach((key) => {
                    that.props.firebase.ref(`chat/room/${that.props.rpath.match.params.key}`).update({roomState: 1})
                });
            }*/

            this.isOnAddMessage = false;
        });

        /*this.props.firebase.ref(`chat/message/${this.props.rpath.match.params.key}`).update(data, () => {
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
        });*/
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
/*            let { lastuser } = this.props.member[last(message).writer];

            if(window.scrollY >= document.body.clientHeight - window.screen.height) {
                if(lastuser !== this.props.auth.uid) {
                    if(last(this.props.room.message).state > 0) {
                        this.props.firebase.ref(`chat/message/${this.props.rpath.match.params.key}/${message.length-1}`).update({state: last(this.props.room.message).state -1});
                    }
                }
            }*/

            let mapping = (data) => {
                return Object.keys(data).map((key, i) => {
                    let { date, text, state, writer} = data[key];
                    let user = this.props.member[writer];

                    return (
                        <div key={`itemMSG${i}`} className={user === this.props.auth.uid ? 'mine' : 'list'}>
                            <div className="imgs">
                                {<img src={ user.avatarUrl ? user.avatarUrl : 'http://placehold.it/40x40' } alt=""/>}
                            </div>
                            <div className="profile">
                                <div>
                                    <em>{ user.displayName }</em> /
                                    [{state}] /
                                    <time dateTime={date}>{latestTime(date)}</time>
                                </div>
                                <p className="message">{text}</p>
                            </div>
                        </div>
                    );
                });
            };

            let newMessage = (type, isMSG) => {
                let that = this;
                setTimeout(()=>{
                    that.newMessgae = false;
                    that.setState({newMessgae: false});
                }, 300);

                if(type === 1 && isMSG) {
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
                        {/*{ newMessage(last(message).state, this.newMessgae) }*/}
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
                      { this.state.msg && this.props.member && mapToList2(this.state.msg) }
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