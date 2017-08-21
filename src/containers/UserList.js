import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
import update from 'react-addons-update'
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/userList.css';

@firebaseConnect([
    'users'
])
@connect(
    ({ firebase }) => ({
        profile: pathToJS(firebase, 'profile'),
        member: pathToJS(firebase, 'ordered'),
    })
)

class UserList extends Component {
    state = {
        handleChanged: [],
        isCreate: false
    };

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
        let joins = {};

        handleChanged.map((data,index)=>{
            if(data) {
                joins[user[index].key] = user[index];
            }
        });

        // 룸정보 저장
        let roomID = this.props.firebase.push('/room', {
            roomName: '방이름을 설정하자!',
            master: this.props.profile,
            joins: joins
        }).key;

        window.location.href= '/roomView/' + roomID;
    };


    render() {
        let mapToUserList = (data) => {
            if(data !== undefined){
                return data.users.map((user, index) => {

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
