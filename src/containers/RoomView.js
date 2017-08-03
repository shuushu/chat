import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS, isEmpty } from 'react-redux-firebase';

import {convertDate} from '../commonJS/Util';

@firebaseConnect((props) => {
    return [{ path: 'rooms/' + props.rpath.match.params.user }]
})

@connect(
    ({ firebase }) => {
        return ({
            auth: pathToJS(firebase, 'auth'),
            roomView: dataToJS(firebase, 'rooms')
        })
    }
)

class App extends Component {
    state = {
        redirect: false,
        ieEmpty: false,
        roomViewData: null,
        latestMsg: ''
    };

    componentWillReceiveProps ({ auth, roomView }) {
        if (auth === null) {
            this.setState({
                redirect: true
            })
        } else {
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


                    this.setState({
                        roomViewData: roomView[this.props.rpath.match.params.user]
                    });
                }
            }
        }
    }

    saveMsg = ( props ) => {

    };

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

        let URL = '/rooms/' + this.props.rpath.match.params.user + '/message';
        this.props.firebase.push(URL, message);

        this.setState({
            latestMsg: ''
        })
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

        let mapToList = (listData) => {
            if(listData !== null) {
                let msgData = listData.message;

                return Object.keys(msgData).map((key) => {
                    if (msgData[key].user === this.props.auth.email) {

                    }
                    return (
                        <div key={key} className={msgData[key].user === this.props.auth.email ? 'mine' : 'list'}>
                            <em>{msgData[key].user}</em>
                            / {msgData[key].sendMsg}
                        </div>
                    );
                });
            }
        };

        return (
              <div className="App">
                  <div id="messages">
                      {mapToList(this.state.roomViewData)}
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
