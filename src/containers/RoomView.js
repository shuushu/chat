import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
import { CSSTransitionGroup } from 'react-transition-group'; // ES6
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
        message: [],
        scroll: 0
    };

    componentDidMount() {
        setTimeout(()=>{
            window.scrollTo(0, document.body.scrollHeight);
        }, 100);
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



    onScroll() {
        const scrollTop = document.body.scrollTop;
        const clientHeight = document.body.clientHeight;
        const screenHeight = window.screen.height;

        if ( scrollTop >= clientHeight - screenHeight ){
            console.log('11')
        } else {
            this.setState({ hasNewMessage: true });
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
            user: this.props.auth.email,
            state: this.props.room[KEY].joins.length,
            sendMsg: this.state.latestMsg,
            time: currentTime,
            seq: convertDate('yymmddhhmmss')
        };

        let msg = this.props.message[KEY];
            msg = msg || [];
            msg.push(message);

        let that = this;

        this.props.firebase.ref(`/message/${KEY}`).update(msg, function(){
            that.onScroll();
            //window.scrollTo(0, document.body.scrollHeight);
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
                        <div key={`itemMSG${i}`} className={data.user === this.props.auth.email ? 'mine' : 'list'}>
                            <em>{data.user}</em>
                            / {data.sendMsg}
                            <p>
                                <strong>{data.time}</strong>
                            </p>
                        </div>
                    )
                });
            }
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
                  <CSSTransitionGroup
                      className="animated message__unread"
                      transitionName={{
                          enter: 'fadeIn',
                          leave: 'fadeOutLeft'
                      }}
                      transitionEnterTimeout={300}
                      transitionLeaveTimeout={1000}>
                      {this.state.hasNewMessage &&
                          <button className="animated waves-effect waves-light btn ">
                              새 메시지가 있습니다.
                              <i className="material-icons right">new_releases</i>
                          </button>
                      }
                  </CSSTransitionGroup>


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
