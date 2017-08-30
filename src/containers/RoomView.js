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
        message: []
    };

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
        const message = {
            user: this.props.auth.email,
            sendMsg: this.state.latestMsg,
            time: currentTime,
            seq: convertDate('yymmddhhmmss')
        };

        let msg = this.props.message[this.props.rpath.match.params.user];
            msg = msg || [];
            msg.push(message);

        this.props.firebase.ref(`/message/${this.props.rpath.match.params.user}`).update(msg);
        this.setState({ latestMsg: '' });
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
                })
            }
        }
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
