import React, { Component } from 'react';
import Routes from './routes';
import Navigation from 'components/Navigation';

export default class Layout extends Component {
    render() {
        return (
            <div>
                <Navigation/>
                <main className="container">
                    <Routes />
                </main>
            </div>
        )
    }
}