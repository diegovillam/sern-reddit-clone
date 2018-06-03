import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Auth from 'modules/Auth';
import * as Pages from 'pages';

const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route {...rest} render={props => (
		Auth.isUserAuthenticated() ? (
			<Component {...props} {...rest} />
		) : (
				<Redirect to={{
					pathname: '/',
					state: { from: props.location }
				}} />
			)
	)} />
)	

const LoggedOutRoute = ({ component: Component, ...rest }) => (
	<Route {...rest} render={props => (
		Auth.isUserAuthenticated() ? (
			<Redirect to={{
				pathname: '/',
				state: { from: props.location }
			}} />
		) : (
				<Component {...props} {...rest} />
			)
	)} />
)

export default class Routes extends Component {

	// Render this component
	render() {
		return (
			<Switch>
				<Route exact path="/" component={Pages.HomePage} />
				<LoggedOutRoute exact path="/login" component={Pages.LoginPage} />
				<LoggedOutRoute exact path="/register" component={Pages.RegisterPage} />
				<PrivateRoute exact path="/logout" component={Pages.LogoutPage} />
				<Route exact path="/r" component={Pages.SubredditsPage} />
				<PrivateRoute exact path="/create/post/:subreddit?" component={Pages.CreatePostPage} />
				<PrivateRoute exact path="/create/:subreddit?" component={Pages.CreateSubredditPage} />
				<Route exact path="/r/:subreddit/mod" component={Pages.ModeratorPage} />
				<Route exact path="/r/:subreddit/:post/:slug?" component={Pages.PostPage} />
				<Route exact path="/r/:subreddit" component={Pages.PostsPage} />
				<Route exact path="/u/:user" component={Pages.UserPage} />
				<PrivateRoute exact path="/dm/send/:user?" component={Pages.SendMessagePage} />
				<PrivateRoute exact path="/dm/inbox" component={Pages.InboxPage} />
				<PrivateRoute exact path="/dm/outbox" component={Pages.OutboxPage} />
			</Switch>
		);
	}
}
