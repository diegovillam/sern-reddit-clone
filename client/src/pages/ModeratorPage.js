import React, { Component } from 'react';
import { connect } from 'react-redux';
import Auth from 'modules/Auth';
import Loading from 'components/Loading';

import { getSubreddit } from 'actions/subredditActions';
import SuspendUser from 'components/moderator/SuspendUser';
import CreateRule from 'components/moderator/CreateRule';
import DeleteRule from 'components/moderator/DeleteRule';
import RevokeSuspension from 'components/moderator/RevokeSuspension';

class ModeratorPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exists: true,
            loading: true,
            moderator: false
        }
    }
    componentDidMount() {

        // The reason we don't use the props.subreddit directly is because the user can access this URL directly or from a link
        // We get the subreddit again for this moderator page
        let sub = this.props.match.params.subreddit;
        this.props.getSubreddit(sub).then(() => {
            // If the prop isn't active after the promise is complete it means this sub doesn't exist
            if(this.props.subreddit === null) {
                this.setState({ exists: false, loading: false });
            } else {
                // The sub exists, let's check if the user is a moderator
                this.setState({ exists: true });
                
                Auth.getUser().then(user => {
                    // From the active sub we can get the moderator by matching it to the user ID
                    for(var i = 0; i < this.props.subreddit.moderators.length; i++) {
                        if(this.props.subreddit.moderators[i].userId === user.id) {
                            this.setState({ moderator: this.props.subreddit.moderators[i] });
                            break;
                        }
                    }
                    this.setState({ loading: false });
                });
            }
        });
    }
    
    render() {
        return (
            this.state.loading === true ? (
                <Loading/>
            ) : (
                (!this.state.moderator || this.state.moderator === false) ? (
                    <div className="box">
                        <h2 className="has-text-weight-semibold is-uppercase is-2">
                            You are not authorized to view this.
                        </h2>
                    </div>
                ) : (
                    <div className="box">
                        
                        <h3 className="has-text-weight-semibold is-uppercase is-3">Moderator options</h3>
                        <hr/>
                        <SuspendUser 
                            rules={this.props.rules}
                            moderator={this.state.moderator}
                        />
                        <hr/>
                        <RevokeSuspension/>
                        <hr/>
                        <CreateRule
                            moderator={this.state.moderator}
                        />
                        <hr/>
                        <DeleteRule
                            moderator={this.state.moderator}
                            rules={this.props.rules}
                        />
                    </div>
                )
            )
        )
    }
}

const mapStateToProps = state => ({
    subreddit: state.subreddits.active,
    rules: state.subreddits.active.rules,
    status: state.moderator.status
})
// Todo
export default connect(mapStateToProps, { getSubreddit })(ModeratorPage);