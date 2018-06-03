import React, { Component } from 'react';

export default class Loading extends Component { 
    
    render() {
        const sizeClass = this.props.size ? {
            fontSize: this.props.size,
            margin: '0',
            padding: '0'
        } : {
            fontSize: '2rem',
            margin: '0',
            padding: '0'
        };

        return (
            this.props.spinner !== undefined ?
                <div className="sk-circle" style={sizeClass}>
                    <div className="sk-circle1 sk-child"></div>
                    <div className="sk-circle2 sk-child"></div>
                    <div className="sk-circle3 sk-child"></div>
                    <div className="sk-circle4 sk-child"></div>
                    <div className="sk-circle5 sk-child"></div>
                    <div className="sk-circle6 sk-child"></div>
                    <div className="sk-circle7 sk-child"></div>
                    <div className="sk-circle8 sk-child"></div>
                    <div className="sk-circle9 sk-child"></div>
                    <div className="sk-circle10 sk-child"></div>
                    <div className="sk-circle11 sk-child"></div>
                    <div className="sk-circle12 sk-child"></div>
                </div>
            :
            <h2 className="is-uppercase is-2 has-text-weight-bold">Loading content...</h2>
        )
    }
}