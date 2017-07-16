import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as memberAction from '../modules/Member';

class RoomList extends Component {
    componentDidMount() {
        this.props.memberAction.initialrize();
    };

    render() {
        const { redirectToReferrer } = this.props.init;

        if (redirectToReferrer) {
            return (
                <Redirect to="/Login" />
            )
        }

        return (
            <div>
                ROOM LIST
            </div>
        );
    }
}

export default connect(
    (state) => ({
        init: state.member
    }),
    (dispatch) => ({
        memberAction: bindActionCreators(memberAction, dispatch)
    })
)(RoomList);
