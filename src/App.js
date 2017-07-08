import React, { Component } from 'react';
import './App.css';
import {convertDate} from './commonJS/Util';
import ChatList from './components/ChatList';

import SocketIOClient from 'socket.io-client';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            latestMsg: '',
            id: null,
            msgArr: [],
            nickname: '',
        };

        // Creating the socket-client instance will automatically connect to the server.
        this.socket = SocketIOClient('http://localhost:3000');
        this.oldNickName;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeNickname = this.handleChangeNickname.bind(this);
        this.changeSubmit = this.changeSubmit.bind(this);
        this.saveMsg = this.saveMsg.bind(this);
    }

    componentDidMount() {
        this.socket.on('init', (data) => {
           this.setState({
               id: data.id,
               nickname: data.nickname
           });
            this.oldNickName = data.nickname;
        });

        this.socket.on('toClient', (data) => {this.saveMsg(data)});
        this.socket.on('toNick', (data) => {this.saveMsg(data)});
    }

    saveMsg(data) {
        const temp = this.state.msgArr;
        temp.push(data);

        this.setState({ msgArr: temp });
    }


    handleChange(e) {
        this.setState({
            latestMsg: e.target.value
        })
    }

    handleSubmit(e) {
        e.preventDefault();
        const currentTime = convertDate("yyyy-MM-dd HH:mm:ss");

        const message = Object.assign({
            user: this.state.id,
            sendMsg: this.state.latestMsg,
            time: currentTime,
            seq: convertDate('yymmddhhmmss')
        });

        this.socket.emit('message', message);

        this.setState({
            latestMsg: ''
        })
    }

    handleChangeNickname(e){
        this.setState({
            nickname: e.target.value
        })
    }

    changeSubmit() {
        this.socket.emit('changeNickName', {
            user: 'system',
            old: this.oldNickName,
            current: this.state.nickname
        });
        this.oldNickName = this.state.nickname;

        // { this.state.isChangedNickname && `${this.state.nickname}으로 변경 했습니다`}
    }

    render() {

        return (
              <div className="App">
                  <p>
                    Name : <input type="text" onChange={this.handleChangeNickname} value={this.state.nickname} />
                    <input type="button" onClick={this.changeSubmit} value="Change name" />
                  </p>


                  <div id="messages">
                      <ChatList
                          socket={this.socket}
                          state={this.state}
                      />
                  </div>

                  <form action="" onSubmit={this.handleSubmit}>
                    <input type="text" id="m"
                           value={this.state.latestMsg}
                           onChange={this.handleChange}
                    />
                    <button>submit</button>
                  </form>


              </div>
        );
    }
}

export default App;
