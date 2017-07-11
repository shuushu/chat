import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Login, RoomList, RoomView } from './containers';

import SocketIOClient from 'socket.io-client';

class App extends Component {
    // Creating the socket-client instance will automatically connect to the server.
    socket = SocketIOClient('http://localhost:3000');

    componentDidMount() {
        this.socket.on('init', (data) => {
            console.log('init /  ' , data);
        });
    }    

    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route path="/roomList" component={RoomList} />
                    <Route path="/roomView/:user" component={RoomView} />
                </Switch>
            </div>
        )
    }
}

export default App;
