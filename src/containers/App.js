import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Login, RoomList, RoomView } from './index';

class App extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/" component={RoomList} />
                    <Route path="/Login" component={Login} />
                    <Route path="/RoomList" component={RoomList} />
                    <Route path="/roomView/:user" component={RoomView} />
                </Switch>
            </div>
        )
    }
}

export default App;
