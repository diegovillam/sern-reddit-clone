import React, { Component } from 'react';

export default class TextField extends Component {
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
            <p className="help is-danger">
                {/* Split the newlines because some errors can be received from the server with them */}
                {this.props.error.split('\n').map((item, key) => {
                    return <span key={key}>{item}<br/></span>
                })}
            </p>
        ) : '';
        const help = this.props.help ? (
            <p className="help is-black">{this.props.help}</p>
        ) : '';
        const classes = 'input' + (this.props.error ? ' is-danger' : '');

        return (
            <div className={"field".concat(this.props.addon ? " has-addons" : "")}>
                {label}
                <div className="control">
                    <input type={this.props.type} name={this.props.name} className={classes} value={this.props.value} placeholder={this.props.placeholder} onChange={this.props.onChange}/>
                </div>
                {this.props.addon && (
                    <div className="control">
                        {this.props.addon}
                    </div>
                )}
                {error}
                {help}
            </div>
        );
    }
}