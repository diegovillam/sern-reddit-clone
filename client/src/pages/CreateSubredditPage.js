import React, { Component } from 'react';
import TextField from 'components/ui/TextField';
import Button from 'components/ui/Button';
import axios from 'axios';
import Auth from 'modules/Auth';

export default class CreateSubredditPage extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            name: this.props.match.params.subreddit || '',
            description: '',
            errors: {},
            sending: false
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({ sending: true });
        
        // I'm placing this here and not in an action creator because I want to edit this components' props after it's done
        // It's a bit coupling but less cumbersome
        Auth.getUser().then(user => {
            axios.post('/api/subreddit', { name: this.state.name, description: this.state.description, userId: user.id }, { headers: Auth.getApiAuthHeader() })
            .then(result => {
                this.setState({ sending: false });
                localStorage.setItem('message', "The community " + this.state.name + " has been created successfully.");
                this.props.history.push('/r/' + this.state.name);
            }).catch(error => {
                console.log(error.response);
                this.setState({ sending: false, errors: error.response.data });
            });
        });
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value, errors: {} });
    }

    render() {
        
        return (
            <div>
                <p className="has-text-weight-semibold is-uppercase">Create new subreddit</p>
                <br/>

                <form action="" onSubmit={this.onSubmit}>
                    {/* The 'help' prop below creates an URL preview in the format of: 
                      * sitename.com/r/<name here> */}
                    <TextField 
                        onChange={this.onChange}
                        name={"name"}
                        type={"text"}
                        label={"Name"}
                        value={this.state.name}
                        error={this.state.errors.name && this.state.errors.name}
                        help={'URL: '.concat(window.location.href.split('/')[2]).concat('/r/').concat(this.state.name)}

                    />
                    
                    
                    <TextField
                        onChange={this.onChange}
                        name={"description"}
                        label={"Description"}
                        error={this.state.errors.description && this.state.errors.description}
                        type={"text"}
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