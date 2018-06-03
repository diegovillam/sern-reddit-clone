import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TextField from 'components/ui/TextField';
import Button from 'components/ui/Button';
import axios from 'axios';
import Auth from 'modules/Auth';

export default class CreateSubredditPage extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            title: '',
            text: '',
            subreddit: this.props.match.params.subreddit || '',
            link: '',
            errors: {},
            sending: false
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({ sending: true });

        axios.post('/api/post/create', { 
            subreddit: this.state.subreddit, 
            title: this.state.title,
            text: this.state.text,
            link: this.state.link,
            token: Auth.getToken()
        }, { headers: Auth.getApiAuthHeader() }).then(results => {
            this.setState({ sending: false });
            // Redirect to the new thread: /r/subreddit/id/slug
            this.props.history.push('/r/'+this.state.subreddit+'/'+results.data.id+'/'+results.data.slug);
        }).catch(error => {
            this.setState({ errors: error.response.data, sending: false });
        });
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value, errors: {} });
    }

    render() {
        return (
            <div>
                <p className="has-text-weight-semibold is-uppercase">Submit new content</p>
                <br/>

                <form action="" onSubmit={this.onSubmit}>
                    <TextField 
                        onChange={this.onChange}
                        name={"title"}
                        type={"text"}
                        label={"Post title"}
                        value={this.state.title}
                        error={this.state.errors.title && this.state.errors.title}
                    />
                    <TextField
                        onChange={this.onChange}
                        name={"text"}
                        label={"Post content"}
                        error={this.state.errors.text && this.state.errors.text}
                        type={"text"}
                    />
                    <TextField
                        onChange={this.onChange}
                        name={"link"}
                        label={"Link URL"}
                        error={this.state.errors.link && this.state.errors.link}
                        type={"text"}
                    />
                    <TextField
                        onChange={this.onChange}
                        name={"subreddit"}
                        label={"Sub to post this in"}
                        error={this.state.errors.subreddit && this.state.errors.subreddit}
                        value={this.state.subreddit}
                        type={"text"}
                    />
                    {this.state.errors.subreddit && (
                        <p>
                            <small><Link to={"/create/subreddit/"+this.state.subreddit}>Create new subreddit?</Link></small>
                        </p>
                    )}
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