import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

const fakeAuth = {
    isAuthenticated: false,
    authenticate(cb) {
        this.isAuthenticated = true;
        setTimeout(cb, 100); // fake async
    },
    signout(cb) {
        this.isAuthenticated = false;
        setTimeout(cb, 100);
    }
}

class Login extends Component {
    state = {
        redirectToReferrer: false
    };

    login = (e) => {
        e.preventDefault();

        fakeAuth.authenticate(() => {
            this.setState({ redirectToReferrer: true })
        })
    };

    render() {
        const { redirectToReferrer } = this.state;

        if (redirectToReferrer) {
            return (
                <Redirect to="/roomList"/>
            )
        }

        return (
            <div>
                <div>email : <input type="text"/></div>
                <div>pw: <input type="password"/></div>
                <button onClick={this.login}>submit</button>
            </div>
        );
    }
}

export default Login;