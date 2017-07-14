import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as memberAction from '../modules/Member';
// UI
import firebase from 'firebase';
import firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';


class Login extends Component {
    state = {
        id: '',
        pw: '',
        regMode: false,
        redirectToReferrer: false
    };

    componentDidMount() {
        let config = {
            apiKey: "AIzaSyBwc5tkZM3fEQcyPC1-HfguTbIt8woO9iA",
            authDomain: "shushu-cb26c.firebaseapp.com",
            databaseURL: "https://shushu-cb26c.firebaseio.com",
            storageBucket: "shushu-cb26c.appspot.com",
        };

        firebase.initializeApp(config);
        // FirebaseUI config.
        let uiConfig = {
            signInSuccessUrl: '/',
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                firebase.auth.GithubAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                firebase.auth.PhoneAuthProvider.PROVIDER_ID
            ],
            // Terms of service url.
            tosUrl: '/roomList'
        };

        // Initialize the FirebaseUI Widget using Firebase.
        let ui = new firebaseui.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    };
    // 로그인 / 회원가입 모드 변경
    handleChangeMode = (e) => {
        this.setState({
            regMode : !this.state.regMode
        });
    };

    signIn = (event) => {
        event.preventDefault();

        firebase.auth().signInWithEmailAndPassword(this.state.id, this.state.pw)
            .then((e) => {
                // LOGIN SUCCESS
                this.setState({
                    redirectToReferrer: true
                })
            })
            .catch(function(error) {
                console.log(error.code , error.message);
            });
        /*this.props.memberAction.getLogin(this.state, () => {
            this.setState({ redirectToReferrer: true });
        });*/
    };

    signUp = (event) => {
        event.preventDefault();

        firebase.auth().createUserWithEmailAndPassword(this.state.id, this.state.pw)
            .catch(function(error) {
                console.log(error.code , error.message);
            });
        //this.props.memberAction.setLogin(this.state);
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
            <form method="post" onSubmit={(e)=>{e.preventDefault();}}>
                <div className="card-content">
                    <div className="row">
                        { inputBox }
                        <button className="waves-effect waves-light btn" onClick={this.signIn} >SUBMIT</button>
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
            <form method="post" onSubmit={(e)=>{e.preventDefault();}}>
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

export default connect(
    (state) => ({}),
    (dispatch) => ({
        memberAction: bindActionCreators(memberAction, dispatch)
    })
)(Login);
