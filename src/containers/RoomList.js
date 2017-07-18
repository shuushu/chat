import React, { Component } from 'react';
import firebase from 'firebase';

class RoomList extends Component {

    logout = () => {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            alert('success')
        }, function(error) {
            // An error happened.
        });
    };

    render() {
        return (
            <div>
                ROOM LIST
                <button onClick={this.logout}>LOGOUT</button>
            </div>
        );
    }
}

export default RoomList;
