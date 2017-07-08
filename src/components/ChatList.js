import React, { Component } from 'react';
import {convertDate} from '../commonJS/Util';

class ChatList extends Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
    }

    render() {
        let {msgArr, id} = this.props.state;

        const systemMsg = (data) => (
            <diV>
                {data.old} / {data.current}
            </diV>
        );

        const defaultMsg = (data, idx) => {
            return (
                <div key={idx} className={data.user === id ? 'list myChat' : 'list'} >
                    <div>
                        <strong>{data.nickname}</strong>
                    </div>
                    <span>{data.sendMsg}</span>
                    <time dateTime={data.time}>{convertDate("a/p hh:mm")}</time>
                </div>
            );
        }

        const mapToList =  msgArr.map((data, idx) => {
            return (
                <div>
                    {data.user === 'system' ?  systemMsg(data) : defaultMsg(data, idx)}
                </div>

            )
        });

        return (
            <div>
                {mapToList}
            </div>
        );
    }
}

export default ChatList;