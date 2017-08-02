import React, { Component } from 'react';
import {convertDate} from '../commonJS/Util';

class ChatList extends Component {
    componentWillReceiveProps () {

    }

    render() {
        let mapToList = () => {
            if(this.props.data !== null) {
                let msgData = this.props.data.message;

                return Object.keys(msgData).map((key, index) => {
                    return (
                        <div key={key}>
                            <span>{msgData.user}</span>
                           {msgData[key].sendMsg}
                        </div>
                    );
                });
            }
        };




        return (
            <div>
                {mapToList()}
            </div>
        );
    }
}

export default ChatList;
