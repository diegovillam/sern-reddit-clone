import React, { Component } from 'react';

export default class Select extends Component {
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

        const classes = 'select' + (this.props.error ? ' is-danger' : '');
        
        return (
            <div className="field">
                {label}
                <div className="control">
                    <select name={this.props.name} className={classes} onChange={this.props.onChange} defaultValue={this.props.default}>
                        {this.props.options.map((option, idx) => {
                            return (
                                <option disabled={'disabled' in option ? 'disabled' : null} key={idx} value={option.value}>{option.name}</option>
                            )
                        })}
                    </select>
                </div>
                {error}
                {help}
            </div>
           
        );
    }
}