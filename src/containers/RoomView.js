import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ChatList from '../components/ChatList';
import '../scss/roomView.css';
import { firebaseConnect, pathToJS, dataToJS, isEmpty } from 'react-redux-firebase';

import {convertDate} from '../commonJS/Util';

@firebaseConnect((props) => {
    return [{ path: 'roomView/' + props.rpath.match.params.user }]
})

@connect(
    ({ firebase }) => {
        return ({
            auth: pathToJS(firebase, 'auth'),
            roomView: dataToJS(firebase, 'roomView')
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
                    console.log(this.props.socket.connected)
                    // console.log(this.props.socket)
                    this.props.socket.emit('joinroom',{
                        roomID: this.props.rpath.match.params.user,
                        user: auth
                     });

                    this.props.socket.on('toClient', (data) => {
                        this.saveMsg(data)
                    });
                    this.props.socket.on('toNick', (data) => {
                        this.saveMsg(data)
                    });

                    this.setState({
                        roomViewData: roomView[this.props.rpath.match.params.user]
                    });
                }
            }
        }
    }


    saveMsg = ( props ) => {
        let URL = '/roomView/' + this.props.rpath.match.params.user + '/message';
        this.props.firebase.push(URL, props)
        //this.props.firebase.push({ some: 'data' });


        /*const temp = this.state.msgArr;
        temp.push(data);

        this.setState({ msgArr: temp });*/
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
            user: '슈슈',
            sendMsg: this.state.latestMsg,
            time: currentTime,
            seq: convertDate('yymmddhhmmss')
        });

        this.props.socket.emit('message', message);

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
            return (
                <div>
                    개설된 방 없음
                    <Link to="/">돌아가기</Link>
                </div>
            )
        }
       {/* <ChatList
            socket={this.socket}
            state={this.state}
        />*/}
        return (
              <div className="App">
                  <div id="messages">
                      <ChatList data={this.state.roomViewData} />
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
