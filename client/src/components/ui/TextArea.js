import React, { Component } from 'react';

export default class TextArea extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(event) {
        this.setState({
            value: event.target.value
        }); 
    }

    render() {
    
        const label = this.props.label ? (
            <label>
                {this.props.label}
            </label>
        ) : '';
        const error = this.props.error ? (
            <p className="help is-danger">{this.props.error}</p>
        ) : '';
        const help = this.props.help ? (
            <p className="help is-black">{this.props.help}</p>
        ) : '';
        const classes = 'textarea' + (this.props.error ? ' is-danger' : '');

        return (
            <div className="field">
                {label}
                <div className="control">
                    <textarea rows={this.props.rows || 0} value={this.props.value} type={this.props.type} name={this.props.name} className={classes} onChange={this.props.onChange}/>
                </div>
                {error}
                {help}
            </div>
        );
    }
}