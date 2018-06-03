import React, { Component } from 'react';
import axios from 'axios';
import Auth from 'modules/Auth';
import { connect } from 'react-redux';
import { login } from 'actions/userActions';

import TextField from 'components/ui/TextField';
import Button from 'components/ui/Button';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            errors: {},
            sending: false,
            successMessage: ''
        };

        // Get the stored message if it exists then remove it...
        const storedMessage = localStorage.getItem('successMessage');
        if(storedMessage) {
            this.state.successMessage = storedMessage;
            localStorage.removeItem('successMessage');
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.changeUser = this.changeUser.bind(this);
    }

    getLoginResponse(username, password) {
        
        axios.post('/auth/login', {
            username: username,
            password: password
        }).then(response => {
            // reset all errors and sending flag
            this.setState({ errors: {}, sending: false });
            // save the token
            Auth.authenticateUser(response.data.token);
            // change the app state
            this.props.login(response.data.user);
            // change the URL to home
            this.props.history.push('/');
        }).catch(err => {
            // set the errors from the response's data
            this.setState({
                errors: err.response.data.errors,
                sending: false
            });
        });
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({ sending: true });
        this.getLoginResponse(this.state.username, this.state.password);
    }

    changeUser(e) {
        this.setState({ [e.target.name]: e.target.value, errors: {} });
    }

    render() {
        return (
            <div>
                {this.state.successMessage && <div className="notification is-success">{this.state.successMessage}</div>}
                {this.state.errors.message && <div className="notification is-danger">{this.state.errors.message}</div>}
                <p className="has-text-weight-semibold is-uppercase">Login your account</p>
                <br/>
                <form action="" onSubmit={this.onSubmit}>
                    <TextField 
                        onChange={this.changeUser}
                        name={"username"}
                        type={"text"}
                        label={"Username"}
                        error={this.state.errors.username && this.state.errors.username}
                        value={this.props.user && this.props.user.username}
                    />
                    <TextField
                        onChange={this.changeUser}
                        name={"password"}
                        label={"Password"}
                        type={"password"}
                        error={this.state.errors.password && this.state.errors.password}
                        value={this.props.user && this.props.user.password}
                    />
                    <Button
                        classes={"is-link"}
                        onClick={this.onSubmit}
                        label={"Login"}
                        sending={this.state.sending}
                    />
                </form>
            </div>
        )
    }
}

export default connect(null, { login })(LoginPage);