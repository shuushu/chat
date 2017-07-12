import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as memberAction from '../modules/Member';


class Login extends Component {
    state = {
        id: '',
        pw: '',
        redirectToReferrer: false
    };

    componentDidMount() {
    };

    signIn = (event) => {
        event.preventDefault();

        this.props.memberAction.getLogin(this.state, () => {
            this.setState({ redirectToReferrer: true });
        });
    };

    signUp = (event) => {
        event.preventDefault();

        this.props.memberAction.setLogin(this.state);
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
                    <button onClick={this.signIn}>Sign in</button>
                    <button onClick={this.signUp}>Sign up</button>
                </form>
            </div>
        );
    }
}

export default connect(
    (state) => ({}),
    (dispatch) => ({
        memberAction: bindActionCreators(memberAction, dispatch)
    })
)(Login);
