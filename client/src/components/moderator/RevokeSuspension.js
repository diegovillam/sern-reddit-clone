import React, { Component } from 'react';
import { connect } from 'react-redux';
import TextField from 'components/ui/TextField';
import Button from 'components/ui/Button';
import { revokeSuspension } from 'actions/moderatorActions';

class RevokeSuspension extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            userId: undefined,
            suspended: false,
            exists: false,
            revokingSuspension: false,
            errors: {}
        }
        this.onChange = this.onChange.bind(this);
        this.checkUser = this.checkUser.bind(this);
        this.revokeSuspension = this.revokeSuspension.bind(this);
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    componentWillReceiveProps(nextProps) {
        // Get the props passed by the store when the action isperformed
        if('errors' in nextProps) {
            this.setState({ errors: nextProps.errors, revokingSuspension: false });
        } 
        // A new status means an action was successful, so we can reset the form's data
        if('status' in nextProps && nextProps.status !== undefined) {
            this.setState({ errors: {}, username: '', exists: false, revokingSuspension: false })
        }
    }
    
    checkUser(e) {
        e.preventDefault();

        // The suspension are contained within this active subreddit's suspension list. We can access it directly
        let suspensions = this.props.subreddit.suspensions, exists = false, id = undefined;
        for(var i = 0; i < suspensions.length; i++) {
            if(suspensions[i].user.username === this.state.username) {
                exists = true;
                id = suspensions[i].userId;
                break;
            }
        }
        if(exists === true) {
            this.setState({ exists: true, userId: id, errors: {} });
        } else {
            this.setState({ errors: {username: 'This user is not suspended.'} });
        }
    }

    revokeSuspension(e) {
        this.setState({ revokingSuspension: true });
        this.props.revokeSuspension(this.state.userId);
    }

    render() {
        return (
            <div>
                <form method="GET" action="" onSubmit={this.checkUser}>
                    {(this.props.status !== undefined && this.props.status.type === 'RevokeSuspension') && (
                        <div className="notification is-success">
                            <strong>{this.props.status.header}</strong>
                            <p>{this.props.status.text}</p>
                        </div>
                    )}
                    <TextField
                        name={"username"}
                        placeholder={"Find an user"}
                        type={"text"}
                        error={this.state.errors.username && this.state.errors.username}
                        value={this.state.username}
                        onChange={this.onChange}
                        help={this.state.exists === true && 'This user is suspended. Click the revoke suspension button to continue.'}
                    />
                    <div className="field is-grouped">
                        <Button
                            classes={"is-link"}
                            onClick={this.checkUser}
                            label={"Check user"}
                        />
                        <Button
                            classes={"is-link"}
                            label={"Revoke suspension"}
                            sending={this.state.revokingSuspension}
                            disabled={!this.state.exists}
                            onClick={this.revokeSuspension}
                        />
                    </div>
                </form>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    status: state.moderator.status,
    subreddit: state.subreddits.active
});

export default connect(mapStateToProps, { revokeSuspension })(RevokeSuspension);