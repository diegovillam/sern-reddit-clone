import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Auth from 'modules/Auth';
import { connect } from 'react-redux';

class Navigation extends Component { 
    constructor(props){
        super(props);
        this.state= {
            showBurgerNav: false
        }
    }


    render() {
        const leftNavbar = "navbar-start navbar-menu".concat(this.state.showBurgerNav === true ? " is-active" : "");
        const rightNavbar = "navbar-end navbar-menu".concat(this.state.showBurgerNav === true ? " is-active" : "");        
        const messagesIcon = (
            <div style={{position: 'relative', float:'left'}}>
                <i className="fa fa-envelope"></i>
                {(this.props.user !== undefined && this.props.messages > 0) && (
                    <span className="badge">{this.props.messages > 99 ? ('99+') : '' + this.props.messages}</span>
                )}
            </div>
        )

        return (
            <div>
                <nav className="navbar is-bold">
                    <div className={leftNavbar}>
                        <Link className="navbar-item" to="/">Home</Link>
                        <Link className="navbar-item" to="/r">Subreddits</Link>
                    </div>
                    {!Auth.isUserAuthenticated() ? (
                        <div className={rightNavbar}>
                            <Link className="navbar-item" to="/login">Login</Link>
                            <Link className="navbar-item" to="/register">Register</Link>
                        </div>
                    ) : (
                        <div className={rightNavbar}>
                            <Link className="navbar-item" to="/logout">Logout</Link>
                            <Link className="navbar-item" to={"/u/"+this.props.user.username}>Profile</Link>
                            <Link className="navbar-item" to="/dm/inbox">{messagesIcon}</Link>
                        </div>
                    )}
                    <div className="navbar-brand">
                        <div className="navbar-burger" onClick={() => this.setState({showBurgerNav: !this.state.showBurgerNav})}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </nav>
                    
                {this.props.messages > 0 && (
                    <div className="mobile-sticky-inbox-w">
                        <div className="mobile-sticky-inbox">
                            <i className="fa fa-2x fa-envelope"></i>
                            <span className="badge-text-only">!</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    user: state.users.user,
    messages: state.users.user.messages,
    socket: state.users.socket
});

export default connect(mapStateToProps, null)(Navigation);