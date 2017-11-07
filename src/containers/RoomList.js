import { mapValues } from 'lodash';
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS, populatedDataToJS } from 'react-redux-firebase';
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/roomList.css';

let populates;
let P_USER, P_MSG;

const populate = { child: '175430085458', root: 'joins' }

@firebaseConnect(
    ({ params }) => ([
        { path: 'room', populates: [populate] } // places "goals" and "users" in redux
    ])
)
@connect(
    ({ firebase }, { params }) => ({
        // mapValues keeps items in list under their key
        goals: mapValues(dataToJS(firebase, 'room/RiHdrLxl81NDFPmejv30j6YytQG3'), (child) => {
            console.log(child)
            // no matching child parameter (no user property on goal)
            if (!child[populate.child]) {
                return child
            }
            // no matching child does not exist in root list (no user matching user property)
            if (!dataToJS(firebase, `${populate.root}/${child[populate.child]}`)) {
                return child
            }
            console.log(...child)
            // populate child
            return {
                ...child,
                key: child[populate.child], // attach key to new object
                [populate.child]: dataToJS(firebase, `${populate.root}/${child[populate.child]}`)
            }
        })
    })
)
/*@firebaseConnect((props) => {
    P_USER = props.rpath.match.params.user;

    populates = [
        { child: 'test', root: 'users'},
        { child: '175430085458', root: 'room'}
    ];

    return [
        //{ path: 'room/' + P_USER},
        { path: '/message', populates},
        {
            path: 'room',
            storeAs: 'todos',
            queryParams: [ `orderByChild=owner`, `equalTo=RiHdrLxl81NDFPmejv30j6YytQG3`]
        },
       /!* { path: 'joins'},
        { path: 'users'}*!/
    ]
})


@connect(
    ({ firebase }) => ({
        //room: dataToJS(firebase, 'room/' + P_USER),
        //auth: pathToJS(firebase, 'auth'),
        cc: populatedDataToJS(firebase, 'users', [populates[0]]),
        cc2: populatedDataToJS(firebase, 'room', [populates[1]]),
        anonymousProjects: dataToJS(firebase, 'room') // path matches storeAs
        //joins: dataToJS(firebase, 'joins'),
        /!*users: dataToJS(firebase, 'users'),*!/
    })
)*/


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
            let msgID = this.props.room[key].message;
            this.props.firebase.remove('/room/' + key).then(()=>{
                this.props.firebase.remove('/message/' + msgID)
            });
        } else {
            alert('권한이 없습니다.');
            return false;
        }
    };

    shouldComponentUpdate(nextProps) {
        return (JSON.stringify(nextProps) !== JSON.stringify(this.props));
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
           console.log(data, UID)
           return (
               <div>sdsd</div>
           )

           return Object.keys(data).map((key, index) => {
               if(this.props.joins) {
                   let joins = this.props.joins[key];

                    return joins.map((joinsKey) => {
                        if(UID === joinsKey) {
                            let getMember = (user) => {
                                return user.map((key) => {
                                    if(this.props.member[key]) {
                                        let { displayName } = this.props.member[key];
                                        return (
                                            <span key={key}>{displayName}</span>
                                        )
                                    }
                                });
                            };

                            let getMessage = (data) => {
                                let msg = this.props.message[data];

                                if(msg) {
                                    return(
                                        <strong>{msg[msg.length-1].sendMsg}</strong>
                                    )
                                }
                            };

                            let getImage = (user) => {
                                return user.map((key, i) => {
                                    if(this.props.member[key]) {
                                        let { avatarUrl, displayName } = this.props.member[key];
                                        return (
                                            <img key={`img${key}`} className={`i${i}`} src={avatarUrl} alt={displayName} />
                                        )
                                    }
                                });
                            };



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
                                    <span className={`thumb circle cnt${joins.length > 4 ? '4' : joins.length }`}>
                                        { this.props.member && getImage(joins) }
                                    </span>
                                    <Link to={`/roomView/${key}`}>
                                        <span>idx : {index}</span>
                                        <p>{this.props.message && getMessage(data[key].message)}</p>
                                        <div className="joins">
                                            참여자 : { this.props.member && getMember(joins) }
                                        </div>
                                    </Link>
                                    <a className="btn-floating btn-large waves-effect waves-light blue" >
                                        <i className="large material-icons" onClick={() => {this.handleDelete(key)}}>delete</i>
                                    </a>
                                </li>
                            );
                        }
                    });
               }
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
                    {this.props.room ? mapToList(this.props.room) : <li>참여방 없음</li> }
                </ul>
            </div>
        );
    }
}

export default RoomList;
