import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { firebaseConnect, pathToJS, dataToJS } from 'react-redux-firebase';
import update from 'react-addons-update';
// UI
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../scss/userList.css';

@firebaseConnect([
    'users','profile'
])
@connect(
    ({ firebase }) => ({
        users: dataToJS(firebase, 'users'),
        profile: pathToJS(firebase, 'profile')
    })
)

class UserList extends Component {
    state = {
        member: []
    };

    handleChange = (e) => {
        console.log(e.target.dataset.idx);
        this.setState({
            member: update(
                this.state.member,
                {
                }
            )
        })
    };

    render() {
        let mapToUserList = (data) => {
            if(data !== undefined){
                return Object.keys(data).map((key, index) => {

                    if(data[key].email === this.props.profile.email) {
                        return true;
                    }

                    return (
                        <li className="item" key={key+index}>
                            <input type="checkbox" data-idx={index} onChange={this.handleChange} id={key} />
                            <label htmlFor={key}>
                                <img src={data[key].avatarUrl} className="thumb" alt={`${data[key].displayName} 썸네일`}/>
                                <div className="context">
                                    <strong>{data[key].displayName}</strong>
                                    {data[key].email}
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
                    {mapToUserList(this.props.users)}
                </ul>
                <footer className="foot">
                    <button className="btn waves-effect waves-light" type="submit" name="action" onClick={this.createRoom} >
                        ROOM CREATE <i className="material-icons right">spa</i>
                    </button>
                </footer>
            </div>
        );
    }
}

export default UserList;
