import React, { Component } from 'react';
import TextArea from 'components/ui/TextArea';
import TextField from 'components/ui/TextField';
import Button from 'components/ui/Button';
import Auth from 'modules/Auth';
import axios from 'axios';
import MessageNavigation from 'components/MessageNavigation';
import { connect } from 'react-redux';
import Sockets from 'modules/Sockets';

class SendMessagePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.match.params.user || '',
            subject: '',
            message: '',
            errors: {},
            sending: false,
            status: ''
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    onSubmit(e) {
        e.preventDefault();
         // Do some clientside checking
         let requiredKeys = ['username', 'message', 'subject'];
         let errors = {};
         requiredKeys.forEach(key => {
             if(!this.state[key] || this.state[key].trim().length === 0 || this.state[key] === 0) {
                 errors[key] = 'The ' + key + ' is required.';
             }
         });
         if(Object.keys(errors).length > 0) {
             this.setState({ errors: errors });
         } else {
             this.setState({ sending: true });
            // Make API request
             axios.post('/api/message', {token: Auth.getToken(), username: this.state.username, subject: this.state.subject, message: this.state.message}, { headers: Auth.getApiAuthHeader() }).then(message => {
                // If message is sent let's send a socket action so that the socket belonging to the target username is notified
                Sockets.emit('send_message', {username: this.state.username});

                // Success
                this.setState({ 
                     sending: false,
                     errors: {},
                     username: '',
                     message: '',
                     subject: '',
                     status: 'A message has been successfully sent to ' + this.state.username + '.'
                });
             }).catch(error => {
                 console.log('Error: ', error.response);
                 // Try to not change this to anything not 'error.response.data'
                 this.setState({ errors: error.response.data, sending: false });
             });
         }      
    }

    render() {
        return (
            <div className="container">
                <MessageNavigation/>
                {this.state.status.length > 0 && (
                    <div className="notification is-success">
                        <strong>Success</strong>
                        <p>{this.state.status}</p>
                    </div>
                )}
                <hr/>
                <form method="POST" action="" onSubmit={this.onSubmit}>
                    <TextField
                        onChange={this.onChange}
                        name={"username"}
                        label={"Username to send message to"}
                        error={this.state.errors.username && this.state.errors.username}
                        value={this.state.username}
                    />
                    <TextField
                        onChange={this.onChange}
                        name={"subject"}
                        label={"Message subject"}
                        error={this.state.errors.subject && this.state.errors.subject}
                        value={this.state.subject}
                    />
                    <TextArea
                        onChange={this.onChange}
                        name={"message"}
                        label={"Message body"}
                        error={this.state.errors.message && this.state.errors.message}
                        value={this.state.message}
                    />
                    <Button
                        classes={"is-link"}
                        onClick={this.onSubmit}
                        label={"Submit"}
                        sending={this.state.sending}
                    />
                </form>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    socket: state.users.socket
});

export default connect(mapStateToProps, null)(SendMessagePage);