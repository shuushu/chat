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
            <diV className="systemMsg">
                {data.old}님이 닉네임을 {data.current}로 변경했습니다.
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
                    {data.type === 'system' ?  systemMsg(data) : defaultMsg(data, idx)}
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