import React, { Component } from 'react';
import { connect } from 'react-redux';
import { suspendUser } from 'actions/moderatorActions';
import TextField from 'components/ui/TextField';
import TextArea from 'components/ui/TextArea';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select'; 

class SuspendUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            reason: '',
            duration: 0,
            rule: 0,
            errors: {},
            durations: [],
            sending: false,
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // Get the props passed by the store when the action isperformed
        if('errors' in nextProps) {
            this.setState({ errors: nextProps.errors, sending: false });
        } 
        // A new status means an action was successful, so we can reset the form's data
        if('status' in nextProps && nextProps.status !== undefined) {
            this.setState({ errors: {}, username: '', reason: '', duration: 0, rule: 0, sending: false })
        }
    }

    onSubmit(e) {
        e.preventDefault();
        // Do some clientside checking
        let requiredKeys = ['username', 'reason', 'duration', 'rule'];
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
            // Dispatch this action with the data
            this.props.suspendUser(
                this.state.username,
                this.state.duration,
                this.state.reason,
                this.state.rule,
                this.props.moderator.subredditId // 'moderator' is this moderator's instance passed by the parent component
            );
        }
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value, errors: {} });
    }

    render() {
        let rules = [];
        for(var i = 0; i < this.props.rules.length; i++) {
            if(this.props.rules[i] === null) continue;
            let val = String(this.props.rules[i].number).concat(': ').concat(this.props.rules[i].title);
            rules.push({
                value: val,
                name: val
            });
        }
        // We will add the default rule and then define the durations
        rules.unshift({
            name: 'Select one', value: '0', disabled: true
        });
        let durations = [
            {name: 'Select one', value: '0', disabled: true},
            {name: '1 hour', value: '1'},
            {name: '6 hour', value: '6'},
            {name: '12 hour', value: '12'},
            {name: '1 day', value: '24'}
        ];
        return (
            <form method="POST" action="" onSubmit={this.onSubmit}>
                {(this.props.status !== undefined && this.props.status.type === 'SuspendUser') && (
                    <div className="notification is-success">
                        <strong>{this.props.status.header}</strong>
                        <p>{this.props.status.text}</p>
                    </div>
                )}
                <h5 className="has-text-weight-semibold is-uppercase is-5">Suspend user</h5>
                <TextField
                    onChange={this.onChange}
                    name={"username"}
                    label={"Username"}
                    error={this.state.errors.username && this.state.errors.username}
                    value={this.state.username}
                />
                <TextArea
                    onChange={this.onChange}
                    name={"reason"}
                    label={"Reason"}
                    rows={3}
                    error={this.state.errors.reason && this.state.errors.reason}
                    value={this.state.reason}
                />
                <Select
                    onChange={this.onChange}
                    name={"duration"}
                    label={"Duration of suspension"}
                    options={durations}
                    default={0}
                    error={this.state.errors.duration && this.state.errors.duration}
                    value={this.state.duration}
                />
                <Select
                    onChange={this.onChange}
                    name={"rule"}
                    label={"Rule that was breached"}
                    options={rules}
                    default={0}
                    error={this.state.errors.rule && this.state.errors.rule}
                    value={this.state.rule}
                />
                <Button
                    classes={"is-link"}
                    onClick={this.onSubmit}
                    label={"Suspend"}
                    sending={this.state.sending}
                />
            </form>            
        )
    }
}

const mapStateToProps = state => ({
    rules: state.subreddits.active.rules,
    errors: state.moderator.errors,
    status: state.moderator.status
});

export default connect(mapStateToProps, { suspendUser })(SuspendUser);