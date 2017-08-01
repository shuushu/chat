import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import ChatList from '../components/ChatList';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
import SocketIOClient from 'socket.io-client';
import {convertDate} from '../commonJS/Util';

@firebaseConnect([
    'roomList'
])
@connect(
    ({ firebase }) => ({
        auth: pathToJS(firebase, 'auth'),
        roomList: dataToJS(firebase, 'roomList')
    })
)

class App extends Component {
    state = {
        redirect: false
    };


    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                redirect: true
            })
        } else {
            let socket = SocketIOClient('http://localhost:3000');
            socket.emit('joinroom',{
                roomID: this.props.match.params.user,
                user: auth
            });
        }
    }


    /*
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
        this.oldNickName = '';

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeNickname = this.handleChangeNickname.bind(this);
        this.changeSubmit = this.changeSubmit.bind(this);
        this.saveMsg = this.saveMsg.bind(this);
    }

    componentDidMount() {
        this.socket.emit('joinroom',{room:'SHUSHU'});

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

        if(this.state.latestMsg === '') {
            alert('메세지를 입력하세요');
            return false;
        }

        const currentTime = convertDate("yyyy-MM-dd HH:mm:ss");

        const message = Object.assign({
            type: 'default',
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
            type: 'system',
            old: this.oldNickName,
            current: this.state.nickname
        });
        this.oldNickName = this.state.nickname;

        // { this.state.isChangedNickname && `${this.state.nickname}으로 변경 했습니다`}
    }
*/
    render() {
        if(this.state.redirect) {
            return (
                <Redirect to="/Login" />
            )
        }

        return (
              <div className="App">
                  <p>
                    Name : <input type="text" onChange={this.handleChangeNickname} value={this.state.nickname} />
                    <input type="button" onClick={this.changeSubmit} value="Change name" />
                  </p>


                  <div id="messages">
       <button onClick={this.getOut}>방탈출</button>
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
