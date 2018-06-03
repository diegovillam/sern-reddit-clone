import React, { Component } from 'react';
import { connect } from 'react-redux';
import { deleteRule } from 'actions/moderatorActions';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

class DeleteRule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            sending: false,
            rule: 0,
            errors: {}
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        // Get the props passed by the store when the action isperformed
        if('errors' in nextProps) {
            this.setState({ errors: nextProps.errors, sending: false });
        } 
        if ('status' in nextProps && nextProps.status !== undefined) {
            // A new status means an action was successful, so we can reset the form's data
            this.setState({ errors: {}, rule: 0, sending: false });
        }
    }

    onChange(e) {
        this.setState({ [e.target.name] : e.target.value, errors: {} });
    }

    onSubmit(e) {
        e.preventDefault();
        
        // Do some clientside checking
        if(this.state.rule === 0 || !this.state.rule) {
            this.setState({ errors: {rule: 'The rule is required.'} });
        } else {
            this.setState({ sending: true });
            // Dispatch this action with the data
            this.props.deleteRule(
                this.state.rule,
                this.props.moderator.subredditId // 'moderator' is this moderator's instance passed by the parent component
            );
        }
    }

    render() {
        // From the passed rules we only want the ID and the name
        let rules = [];
        for(var i = 0; i < this.props.rules.length; i++) {
            if(this.props.rules[i] === null) continue;
            rules.push({
                value: Number(this.props.rules[i].id),
                name: String(this.props.rules[i].number).concat(': ').concat(this.props.rules[i].title)
            });
        }
        // We will add the default rule and then define the durations
        rules.unshift({
            name: 'Select one', value: '0', disabled: true
        });

        return (
            <form className="POST" action="">
                {(this.props.status !== undefined && this.props.status.type === 'DeleteRule') && (
                    <div className="notification is-success">
                        <strong>{this.props.status.header}</strong>
                        <p>{this.props.status.text}</p>
                    </div>
                )}
                <h5 className="has-text-weight-semibold is-uppercase is-5">Delete a rule</h5>
                <Select
                    onChange={this.onChange}
                    name={"rule"}
                    label={"Select a rule to delete"}
                    options={rules}
                    default={0}
                    error={this.state.errors.rule && this.state.errors.rule}
                    value={this.state.rule}
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
    rules: state.subreddits.active.rules,
    errors: state.moderator.errors,
    status: state.moderator.status
});

export default connect(mapStateToProps, { deleteRule })(DeleteRule);