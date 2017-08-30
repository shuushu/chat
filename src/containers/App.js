import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { RoomList, RoomView, Login, UserList } from './index';

class App extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/" component={RoomList} />
                    <Route path="/Login" component={Login} />
                    <Route path="/UserList" component={UserList} />
                    <Route path="/RoomList" component={RoomList} />
                    <Route path="/roomView/:user" render={(path) => ( <RoomView rpath={path} /> )}  />
                </Switch>
            </div>
        )
    }
}

export default App;
