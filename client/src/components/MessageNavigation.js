import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import Loading from 'components/Loading';

class MessageNavigation extends Component {
    render () {
        return (
            this.props.messages === undefined ? (
                <div>
                    {/* If props.messages is undefined, the component hasn't acquired the unread messages from the store */}
                    <Loading/>
                </div>
            ) : (
                <p className="is-5 has-text-weight-semibold black">
                    <span className="msgNav">
                        <NavLink activeClassName="is-uppercase" to="/dm/send">Send new</NavLink>
                    </span>
                    |
                    <span className="msgNav">
                        <NavLink exact activeClassName="is-uppercase" to="/dm/inbox">Incoming ({this.props.messages})</NavLink> 
                    </span>
                    |
                    <span className="msgNav">
                        <NavLink exact activeClassName="is-uppercase" to="/dm/outbox">Outgoing</NavLink>
                    </span>
                </p>
            )
        )
    }
}

const mapStateToProps = state => ({
    messages: state.users.user.messages
});

export default connect(mapStateToProps, null)(MessageNavigation);