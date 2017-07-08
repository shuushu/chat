import React, { Component } from 'react';
import './App.css';
import {convertDate} from './commonJS/Util';

import SocketIOClient from 'socket.io-client';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            latestMsg: '',
            id: null,
            msgArr: []
        }

        // Creating the socket-client instance will automatically connect to the server.
        this.socket = SocketIOClient('http://localhost:3000');

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.socket.on('init', (socketID) => {
           console.log(socketID);
           this.setState({
               id: socketID
           });
        });

        this.socket.on('toClient', (data) => {
            const temp = this.state.msgArr;
            temp.push(data);

            this.setState({ msgArr: temp });
        });
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

    render() {
        const mapToList = (list) => {
            return list.map((data,idx) => {
                return (
                    <li
                        className={data.user === this.state.id && 'myChat'}
                        key={idx}
                    >
                        <span>{data.sendMsg}</span>
                        <time dateTime={this.state.time}>{convertDate("a/p hh:mm")}</time>
                    </li>
                );
            });
        }

        return (
              <div className="App">

                  <ul id="messages">
                      {mapToList(this.state.msgArr)}
                  </ul>

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
