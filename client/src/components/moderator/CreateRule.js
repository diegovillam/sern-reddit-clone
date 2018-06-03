import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createRule } from 'actions/moderatorActions';
import TextField from 'components/ui/TextField';
import Button from 'components/ui/Button';
import TextArea from 'components/ui/TextArea';
import Select from 'components/ui/Select';

class CreateRule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            description: '',
            type: 0,
            //
            errors: {},
            sending: false
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // Get the props passed by the store when the action isperformed
        if('errors' in nextProps) {
            this.setState({ errors: nextProps.errors, sending: false });
        } if ('status' in nextProps && nextProps.status !== undefined) {
            // A new status means an action was successful, so we can reset the form's data
            this.setState({ errors: {}, title: '', description: '', type: 0, sending: false });
        }
    }

    onChange(e) {
        let rule = this.state;
        rule[e.target.name] = e.target.value;
        this.setState({ rule, errors: {} });
    }

    onSubmit(e) {
        e.preventDefault();
        
        // Do some clientside checking
        let requiredKeys = ['title', 'description', 'type'];
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
            this.props.createRule(
                this.state.title,
                this.state.description,
                this.state.type,
                this.props.moderator.subredditId // 'moderator' is this moderator's instance passed by the parent component
            );
        }
    }

    render() {
        return (
            <form method="POST" action="" onSubmit={this.onSubmit}>
                {(this.props.status !== undefined && this.props.status.type === 'CreateRule') && (
                    <div className="notification is-success">
                        <strong>{this.props.status.header}</strong>
                        <p>{this.props.status.text}</p>
                    </div>
                )}
                <h5 className="has-text-weight-semibold is-uppercase is-5">Create new rule</h5>
                <TextField
                    onChange={this.onChange}
                    name={"title"}
                    label={"Rule title"}
                    error={this.state.errors.title && this.state.errors.title}
                    value={this.state.title}
                />
                <TextArea
                    onChange={this.onChange}
                    name={"description"}
                    label={"Rule description"}
                    rows={3}
                    error={this.state.errors.description && this.state.errors.description}
                    value={this.state.description}
                />
                <Select
                    onChange={this.onChange}
                    name={"type"}
                    label={"Type of rule"}
                    options={[
                        {name: 'Select one', value: 0, disabled: true, selected: true},
                        {name: 'Submissions only', value: 1},
                        {name: 'Replies only', value:2 },
                        {name: 'Submissions and replies', value: 3}
                    ]}
                    default={0}
                    error={this.state.errors.type && this.state.errors.type}
                    value={this.state.type}
                />
                <Button
                    classes={"is-link"}
                    onClick={this.onSubmit}
                    label={"Submit"}
                    sending={this.state.sending}
                />
            </form>
        )
    }
}

const mapStateToProps = state => ({
    errors: state.moderator.errors,
    status: state.moderator.status
});

export default connect(mapStateToProps, { createRule })(CreateRule);