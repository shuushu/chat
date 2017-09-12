import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
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
            profile: pathToJS(firebase, 'profile'),
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
        newMsg: false
    };

    componentDidMount() {
        setTimeout(()=>{
            window.scrollTo(0, document.body.scrollHeight);
        }, 100);

        //this.setState({ newMsg: true });
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

    onScroll(lastMsg) {
        const scrollTop = document.body.scrollTop;
        const clientHeight = document.body.clientHeight;
        const screenHeight = window.screen.height;

        if ( scrollTop >= clientHeight - screenHeight ){
            console.log(lastMsg)
        } else {

            /*if(lastMsg.uid === this.props.auth.uid) {

            } else {

            }*/
        }
    }

    scrollToBottom() {
        setTimeout(()=>{
            window.scrollTo(0, document.body.scrollHeight);
        }, 100);

        this.setState({
            isScrollAtBottom: true,
            hasNewMessage: false
        });
    }


    // input TEXT
    handleChange = (e) => {
        this.setState({
            latestMsg: e.target.value
        })
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
            /*let msg = that.props.message[that.props.rpath.match.params.user];

            that.onScroll(msg[msg.length-1]);*/

            window.scrollTo(0, document.body.scrollHeight);
            that.setState({ latestMsg: '' });
        });
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

        let mapToList2 = (message) => {
            let key = this.props.rpath.match.params.user;

            if(message[key]) {
                let msgData = message[key];

                return msgData.map((data,i) => {
                    return (
                        <div key={`itemMSG${i}`} className={data.uid === this.props.auth.uid ? 'mine' : 'list'}>
                            <div className="imgs">
                                <img src={data.avatarUrl ? data.avatarUrl : 'http://placehold.it/40x40' } alt=""/>
                            </div>
                            <div className="profile">
                                <div>
                                    <em>{data.nickName}</em> /
                                    <time dateTime={data.time}>{data.time}</time>
                                    <span className="state">{data.state}</span>
                                </div>
                                <p className="message">{data.sendMsg}</p>
                            </div>
                        </div>
                    )
                });
            }
        };

        let test = (newMsg) => {
            //if(newMsg) {
                let msgArr = this.props.message[this.props.rpath.match.params.user];
                console.log(msgArr[msgArr.length-1]);
            //}
        };

        // {mapToList(this.state.roomViewData)}
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
                  {this.props.message && test(this.state.newMsg)}

                  {this.state.hasNewMessage &&
                      <button className="animated message__unread fadeIn waves-effect waves-light btn">
                          새 메시지가 있습니다.
                          <i className="material-icons right">new_releases</i>
                      </button>
                  }


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
