import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getLogin, setLogin } from '../modules/Member';

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
        id: '',
        pw: '',
        socketID: '',
        redirectToReferrer: false
    };

    componentDidMount() {
    };

    login = (e) => {
        getLogin(this.state, () => {
            this.setState({ redirectToReferrer: true })
        });
    };

    signUp = (e) => {
        setLogin(this.state, () => {
            this.setState({ redirectToReferrer: true })
        });
    };

    handleChange = (e) => {
        let { name, value } = e.target;
        this.setState({
           [name] : value
        });
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
                <form method="post" onSubmit={(e)=>{e.preventDefault();}}>
                    <div>
                        email :
                        <input name="id" type="email" required="required"
                               placeholder="sophie@example.com"
                               value={this.state.id}
                               onChange={this.handleChange}
                        />
                    </div>
                    <div>
                        pw:
                        <input name="pw" type="password"
                               value={this.state.pw}
                               onChange={this.handleChange}
                        />
                    </div>
                    <button onClick={this.login}>Sign in</button>
                    <button onClick={this.signUp}>Sign up</button>
                </form>
            </div>
        );
    }
}

export default Login;
