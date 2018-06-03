import React, { Component } from 'react';

export default class Button extends Component {
    render() {
        let styles = {marginTop: '2px', marginRight: '10px'};
        return (
            this.props.sending ? (
                <div className="control">
                    <button disabled style={styles} className={'button ' + this.props.classes + ' is-loading'} onClick={this.props.onClick && this.props.onClick}>{this.props.label}</button>
                </div>
            ) : (
                <div className="control">
                    <button disabled={this.props.disabled || false} style={styles} className={'button ' + this.props.classes} onClick={this.props.onClick && this.props.onClick}>{this.props.label}</button>
                </div>
            )
        );
    }
}