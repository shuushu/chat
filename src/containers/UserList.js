import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
import update from 'react-addons-update'
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/userList.css';
import {convertDate} from '../commonJS/Util';

@firebaseConnect([
    'users'
])
@connect(
    ({ firebase }) => ({
        auth: pathToJS(firebase, 'auth'),
        profile: pathToJS(firebase, 'profile'),
        member: pathToJS(firebase, 'ordered'),
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
            let cnt = 0;
            this.state.handleChanged.map((i)=>{
                if(i) { cnt++ }
            });

            this.setState({
                isCreate: (cnt > 0)
            })
        });
    };

    createRoom = () => {
        let handleChanged = this.state.handleChanged;
        let user = this.props.member.users;
        let joins = [];

        handleChanged.map((data,index)=>{
            // 체크된 유저만 joinArr 담는다
            if(data) {
                joins.push(user[index].key);
            }
        });
        // 방장도 joins로 넣는다.
        joins.push(this.props.auth.uid);

        // 룸정보 저장
        let roomID = this.props.firebase.push('/room', {
            message: this.props.socket.id,
            master: this.props.auth.uid,
            joins: joins
        }).key;


        window.location.href= '/roomView/' + roomID;
    };


    render() {
        if(this.state.isLogin) {
            return (
                <Redirect to="/Login" />
            )
        }

        let mapToUserList = (data) => {
            if(data){
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
            }
        };

        return (
            <div className="userList">
                <ul className="itemWrap">
                    {mapToUserList(this.props.member)}
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
