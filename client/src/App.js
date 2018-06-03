import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom'
import Layout from './Layout';
import { checkCredentials } from 'actions/userActions';

// CSS
import 'bulma/css/bulma.css';
import 'font-awesome/css/font-awesome.min.css';

class App extends Component {

	componentDidMount() {
		this.props.checkCredentials();
	}

	render() {
		return (
			<Router>
				<div className="App">
					<Layout />
				</div>
			</Router>
		);
	}
}

export default connect(null, { checkCredentials })(App);
