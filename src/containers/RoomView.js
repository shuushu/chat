import { mapValues, size, slice, lastIndexOf, last, reduce } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS, populatedDataToJS } from 'react-redux-firebase';
import {convertDate, convertTime, latestTime} from '../commonJS/Util';
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group';

const populate = { child: 'users', root: 'chat' };
let page = 2;

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
        let uid, user = props.firebase.auth().currentUser;

        if (user !== null) {
            uid = user.uid;
        }

        return ({
            auth: pathToJS(firebase, 'auth'),
            room: dataToJS(firebase, 'chat/room/' + props.rpath.match.params.key),
            message: dataToJS(firebase, 'message'),
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
        this.onload = false;  // 룸 첫번째 렌더

        this.onScroll = this.onScroll.bind(this);
        this.addMessage = this.addMessage.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll, true);

        this.onload = true;
    }

    shouldComponentUpdate(nextProps, nextState){
        if(this.props.message === nextProps.message && this.state.latestMsg === nextState.latestMsg){
            return false;
        }
        // props > state로 메세지 지정
        if(this.props.message && this.onload){
            this.setState({
                msg: this.props.message
            });

            this.onload = false;
        }
        // 로그인 여부
        if (!this.props.auth) {
            this.setState({ redirect: true });
        }

        // 룸 첫번째 렌더
        if(this.props.message && this.onload) {
            window.scrollTo(0, document.body.scrollHeight);
            this.onload = false;
        }

        if(this.props.message) {
            if(this.props.message.length !== nextProps.message.length) {
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

    addMessage = (e) => {
        e.preventDefault();

        page++;
        let data = this.props.firebase.ref('chat/message/' + this.props.rpath.match.params.key).orderByChild('date').limitToLast(page);

        data.on('value', (snap) => {
            this.setState({
                msg: snap.val()
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
            //state: size(this.props.room.join)-1,
            state: 0,
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

        if(this.state.isEmpty) {
            alert('개설된 방이 없음');

            return (
                <Redirect to={`/Login`} />
            )
        }


        let mapToList2 = (message) => {
            let { providerData } = last(message).writer;

            if(window.scrollY >= document.body.clientHeight - window.screen.height) {
                if(providerData !== this.props.auth.uid) {
                    if(last(this.props.room.message).state > 0) {
                        this.props.firebase.ref(`chat/message/${this.props.rpath.match.params.key}/${message.length-1}`).update({state: last(this.props.room.message).state -1});
                    }
                }
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
                        { newMessage(last(message).state, this.newMessgae) }
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
                      {/*{ Array.isArray(this.props.room.message) && mapToList2(this.props.room.message)}*/}
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