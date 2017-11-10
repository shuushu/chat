import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
import update from 'react-addons-update'
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/userList.css';
import {convertDate} from '../commonJS/Util';

@firebaseConnect([
    'chat'
])
@connect(
    ({ firebase }) => ({
        auth: pathToJS(firebase, 'auth'),
        member: dataToJS(firebase, 'chat/users'),
    })
)

class UserList extends Component {
    state = {
        handleChanged: [],
        isCreate: false,
        isLogin: false
    };

    componentWillReceiveProps ({ auth }) {
        if (auth === null) {
            this.setState({
                isLogin: true
            })
        }
    }

    handleChange = (e) => {
        let cnt = 0;
        let idx = e.target.dataset.idx;
        this.setState({
            handleChanged: update(
                this.state.handleChanged, {
                    [idx]: {
                        $set: e.target.checked
                    }
                }
            )
        }, () => {
            for(let i=0;i<this.state.handleChanged.length;i++) {
                if(this.state.handleChanged[i]) { cnt++ }
            }

            this.setState({
                isCreate: (cnt > 0)
            })
        });
    };

    createRoom = () => {
        let handleChanged = this.state.handleChanged;
        let user = this.props.member.users;
        let joins = [];

        for(let i=0;i<handleChanged.length;i++) {
            // 체크된 유저만 joinArr 담는다
            if(handleChanged[i]) {
                joins.push(user[i].key);
            }
        }

        // 방장도 joins로 넣는다.
        joins.push(this.props.auth.uid);

        let updates = {};
        // 룸정보 저장 PK = 실시간타임
        const KEY = convertDate('yymmddhhmmss');

        joins.map((uid, idx) => {
            updates['/chat/room/' + uid + '/' + KEY] = {
                message: KEY,
                join: joins,
                msgCnt: 0,
                roomState: 0
            };

            this.props.firebase.ref().update(updates);
        });

        window.location.href= '/roomView/' + KEY;
    };


    render() {
        if(this.state.isLogin) {
            return (
                <Redirect to="/Login" />
            )
        }

        let mapToUserList = (data) => {

            return Object.keys(data).map((key, i)  => {
                let { avatarUrl, displayName, email } = data[key];

                if(this.props.auth.uid === key) {
                    return;
                }


                return (
                    <li className="item" key={`users${i}`}>
                        <input type="checkbox" data-idx={i} onChange={this.handleChange} id={key} />
                        <label htmlFor={key}>
                            <img src={avatarUrl} className="thumb" alt={`${displayName} 썸네일`}/>
                            <div className="context">
                                <strong>{displayName}</strong>
                                {email}
                            </div>
                        </label>
                    </li>
                );
            });






            /*if(data){
                // props가 갱신이 안될때 리턴
                if(!data.users) return;

                return data.users.map((user, index) => {
                    // 프로필이 갱신이 안될때 리턴
                    if(!this.props.profile) return;
                    //  멤버노드를 검색한다. 자신일 경우에는 렌더 제외한다.
                    if(user.email === this.props.profile.email) {
                        return true;
                    }

                    return (
                        <li className="item" key={user.key+index}>
                            <input type="checkbox" data-idx={index} onChange={this.handleChange} id={user.key} />
                            <label htmlFor={user.key}>
                                <img src={user.avatarUrl} className="thumb" alt={`${user.displayName} 썸네일`}/>
                                <div className="context">
                                    <strong>{user.displayName}</strong>
                                    {user.email}
                                </div>
                            </label>
                        </li>
                    );
                })
            }*/
        };

        return (
            <div className="userList">
                <ul className="itemWrap">
                    { this.props.member && mapToUserList(this.props.member) }
                </ul>
                <footer className="foot">
                    <button className={`btn waves-effect waves-light ${!this.state.isCreate && 'disabled'}`} type="submit" name="action" onClick={this.createRoom} >
                        ROOM CREATE <i className="material-icons right">spa</i>
                    </button>
                </footer>
            </div>
        );
    }
}

export default UserList;
