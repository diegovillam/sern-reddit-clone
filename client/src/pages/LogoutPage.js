import React, { Component } from 'react';
import Auth from 'modules/Auth';
import { connect } from 'react-redux';
import { logout } from 'actions/userActions';

class LogoutPage extends Component {
    componentDidMount() {
        Auth.deauthenticateUser();
        this.props.logout();
        this.props.history.push('/');
    }

    render() {
        return (
            <div className="notification is-success">
                <p className="subtitle is-4">Successfully logged out.</p>
            </div>
        );
    }
}

export default connect(null, {logout})(LogoutPage);