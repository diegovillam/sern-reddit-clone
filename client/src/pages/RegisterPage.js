import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import TextField from 'components/ui/TextField';
import Button from 'components/ui/Button';
import axios from 'axios';

export default class RegisterPage extends Component {

    // Constructor
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            sending: false,
            errors: {}
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.changeUser = this.changeUser.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({ sending: true });
        this.getSignupResponse(this.state.username, this.state.password);
    }

    getSignupResponse(username, password) {
        axios.post('/auth/signup', {
            username: username,
            password: password
        }).then(response => {
            console.log("Response received");
            if(response.status === 200) {
                // success
                this.setState({ errors: {}, sending: false });
                // set message
                localStorage.setItem('successMessage', response.data.message);
                // redirect
                this.props.history.push('/login');
            } 
            else {// error
                this.setState({
                    errors: response.data.errors,
                    sending: false
                });
            }
        }).catch(err => {
            // adjust the errors from the response
            this.setState({
                errors: err.response.data.errors,
                sending: false
            });
        });
    }

    // Adjust the state for when the inputs change
    changeUser(e) {
        // Password validation for "password" named input
        if(e.target.name === 'password') {
            if(!this.validatePassword(e.target.value)) {
                this.setState({
                    errors: {password : 'The password must be at least six characters long.', username: this.state.errors.username}
                });
            } else {
                this.setState({
                    errors: {password: '', username: this.state.errors.username}
                });
            }
        }
        // Validation for "username" named input
        if(e.target.name === 'username') {
            if(!e.target.value.length) {
                this.setState({
                    errors: {username: 'Please provide a correct username.', password: this.state.errors.password}
                });
            } else {
                this.setState({
                    errors: {username: '', password: this.state.errors.password}
                });
            }
        }

        this.setState({ [e.target.name]: e.target.value });
    }

    // Validate password with required amount of characters
    validatePassword(password) {
        return password.length > 6 ? true : false;
    }

    // Render this component
    render() {
        return (
            <div>
                <p className="has-text-weight-semibold is-uppercase">Register an account</p>
                <br/>
                <form action="" onSubmit={this.onSubmit}>
                    <TextField 
                        onChange={this.changeUser}
                        name={"username"}
                        type={"text"}
                        label={"Username"}
                        error={this.state.errors.username && this.state.errors.username}
                    />
                    <TextField
                        onChange={this.changeUser}
                        name={"password"}
                        label={"Password"}
                        error={this.state.errors.password && this.state.errors.password}
                        type={"password"}
                    />

                    <Button
                        classes={"is-link"}
                        onClick={this.onSubmit}
                        label={"Register"}
                        sending={this.state.sending}
                    />
                </form>
            </div>
        );
    }
}