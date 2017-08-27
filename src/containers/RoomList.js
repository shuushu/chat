import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/roomList.css';

@firebaseConnect([
    'room','users', 'message'
])
@connect(
    ({ firebase }) => ({
        auth: pathToJS(firebase, 'auth'),
        room: dataToJS(firebase, 'room'),
        member: dataToJS(firebase, 'users'),
        message: dataToJS(firebase, 'message')
    })
)

class RoomList extends Component {
    state = {
        isLogin: false,
        isCreate: {
            created: false,
            url: null
        },
        latestMsg: '',
    };

    componentDidMount() {
        this.props.firebase.ref('/message/H5V4crngi0f_g6HAAAAD').on('value', (snapshot) => {
            this.setState({
                message: snapshot.val()
            })
        });

    }

    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                isLogin: true
            })
        }
    }

    logout = () => {
        this.props.firebase.logout();
    };

    // 방 삭제
    handleDelete = (key) => {
        if(this.props.auth.uid === this.props.room[key].master){
            this.props.firebase.remove('/room/' + key);
        } else {
            alert('권한이 없습니다.');
            return false;
        }
    };

    shouldComponentUpdate(nextProps) {
        return (JSON.stringify(nextProps) != JSON.stringify(this.props));
    }

    render() {
        if(this.state.isLogin) {
            return (
                <Redirect to="/Login" />
            )
        }
        if(this.state.isCreate.created) {
            return (
                <Redirect to={`/roomView/${this.state.isCreate.url}`} />
            )
        }

        let mapToList = (data) => {
           let UID = this.props.auth.uid;

           return Object.keys(data).map((key, index) => {
               let { joins } = data[key];

                return joins.map((joinsKey) => {
                    if(UID === joinsKey) {
                        let getMember = (user) => {
                            return user.map((key) => {
                                let { displayName } = this.props.member[key];
                                return (
                                    <span key={key}>{displayName}</span>
                                )
                            });
                        };

                        let getMessage = (data) => {
                            console.log(this.props.message[data]);
                        }



                        /*let latestMsg = (msg) => {
                            this.props.firebase.ref('/message/' + msg).limitToLast(1).on('value', (snapshot) => {
                                let data = snapshot.val();
                                //console.log(data);
                                this.setState({
                                    latestMsg: 222
                                })
                            });
                        };

                        latestMsg(data[key].message)*/

                        // 참여인원 / {getMember(data[key].joins)}
                        return (
                            <li key={key} className="collection-item avatar">
                                <img src={`http://lorempixel.com/200/200/${index}`} className="circle" alt={data[key].master.displayName} />
                                <Link to={`/roomView/${key}`}>
                                    <span>idx : {index}</span>
                                    <p><strong>{this.props.message && getMessage(data[key].message)}</strong></p>
                                    <div className="joins">
                                        참여자 :
                                        {this.props.member !== undefined &&
                                            getMember(data[key].joins)
                                        }
                                    </div>
                                </Link>
                                <a className="btn-floating btn-large waves-effect waves-light blue" >
                                    <i className="large material-icons" onClick={() => {this.handleDelete(key)}}>delete</i>
                                </a>
                            </li>
                        );
                    }
                });

           });
        };

        return (
            <div>
                <nav>
                    <div className="nav-wrapper">
                        <a href="#!" className="brand-logo">ROOM LIST</a>
                        <ul className="right hide-on-med-and-down">
                            <li><a href="sass.html"><i className="material-icons left">search</i>Link with Left Icon</a></li>
                            <li><a href="#" onClick={this.logout}><i className="material-icons right">view_module</i>logout</a></li>
                        </ul>
                    </div>
                </nav>

                <ul className="collection">
                    {this.props.room !== undefined && mapToList(this.props.room)}
                </ul>
            </div>
        );
    }
}

export default RoomList;
