import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { convertDate } from '../commonJS/Util';
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import { firebaseConnect, pathToJS } from 'react-redux-firebase'


@firebaseConnect()
@connect(
  ({ firebase }) => ({
      auth : pathToJS(firebase, 'auth')
  })
)

class Login extends Component {
    state = {
        id: '',
        pw: '',
        regMode: false,
        redirect: false,
        isJoins: true,
        uid: ''
    };

    componentWillReceiveProps ({ auth }) {
        if (auth) {

            /*this.setState({
                redirect: true,
                uid: auth.uid
            })*/
        }
    }
    // 로그인 / 회원가입 모드 변경
    handleChangeMode = () => {
        this.setState({
            regMode : !this.state.regMode
        });
    };
    // 로그인
    signIn = (event) => {
        event.preventDefault();

        let credentials = {
            email: this.state.id,
            password: this.state.pw,
        };

        if(event.target.id !== 'email') {
            credentials.provider = event.target.id;
            credentials.type = 'popup';
        }

        this.props.firebase.login(credentials).catch(function(error) {
            console.log(error.message);
        });
    };
    // 회원가입
    signUp = (event) => {
        event.preventDefault();

        this.props.firebase.createUser(
            {
                email: this.state.id,
                password: this.state.pw,
                signIn: true
            },
            {
                avatarUrl: "http://lorempixel.com/120/120/?1",
                displayName: "슈슈",
                email: this.state.id,
                providerData: [{
                    displayName: "슈슈",
                    email: this.state.id,
                    photoURL: "http://lorempixel.com/120/120/?1",
                    providerId: "email",
                    uid: convertDate('yymmddhhmmss')
                }]
            }
        );
    };

    handleChange = (e) => {
        let { name, value } = e.target;

        this.setState({
           [name] : value
        });
    };


    render() {
        if(this.state.redirect) {
            return (
                <Redirect to={`/roomList/${this.state.uid}`} />
            )
        }
        const inputBox = (
            <div>
                <div className="input-field col s12 username">
                    <label>Username</label>
                    <input name="id" type="email" required="required"
                           value={this.state.id}
                           onChange={this.handleChange}
                    />
                </div>
                <div className="input-field col s12">
                    <label>Password</label>
                    <input name="pw" type="password"
                           value={this.state.pw}
                           onChange={this.handleChange}
                    />
                </div>
            </div>
        );

        const loginView = (
            <form onSubmit={(e) => {e.preventDefault()}}>
                <div className="card-content">
                    <div className="row">
                        { inputBox }
                        <button id="email" className="waves-effect waves-light btn" onClick={this.signIn} >SUBMIT</button>

                        <button id="google" className="waves-effect waves-light btn" onClick={this.signIn} >
                            Google
                            <i className="material-icons right">filter_drama</i>
                        </button>

                        <button id="facebook"  className="waves-effect waves-light btn" onClick={this.signIn} >
                            facebook
                            <i className="material-icons right">thumb_up</i>
                        </button>

                    </div>
                </div>
                <div className="footer">
                    <div className="card-content">
                        <div className="right" >
                            New Here? <a onClick={this.handleChangeMode}>Create an account</a>
                        </div>
                    </div>
                </div>
            </form>
        );

        const registerView = (
            <form method="post" action="/">
                <div className="card-content">
                    <div className="row">
                        { inputBox }
                        <div>
                            <button className="btn waves-effect waves-light" type="submit" name="action" onClick={this.signUp} >CREATE
                                <i className="material-icons right">send</i>
                            </button>
                            <button className="waves-effect waves-light btn" onClick={this.handleChangeMode} >CANCLE</button>
                        </div>
                    </div>
                </div>
            </form>
        );

        return (

            <div className="container auth">
                <a className="logo">MEMOPAD</a>
                <div className="card">
                    <div className="header blue white-text center">
                        <div className="card-content">
                            {this.state.regMode ? "REGISTER" : "LOGIN"}
                        </div>
                    </div>
                    {this.state.regMode ? registerView : loginView}
                </div>
                <div id="firebaseui-auth-container" />
            </div>
        );
    }
}

export default Login;
