import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

class LinksSidebar extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            // This flag determines whether user is shown moderation links in the sidebar
            mod: false
        }
    }

    componentDidMount() {
        // If the list of moderators includes this user, user must be a moderator
        if('id' in this.props.user && 'moderators' in this.props.subreddit && Object.keys(this.props.subreddit)) {
            for(var i = 0; i < this.props.subreddit.moderators.length; i++) {
                if(this.props.subreddit.moderators[i].userId === this.props.user.id){
                    this.setState({ mod: this.props.subreddit.moderators[i] });
                    break;
                }
            }            
        }
    }
    
    render() {
        return (
            <div>
                <div className="box">
                    <p><Link to="/create">Create subreddit</Link></p>
                    <p><Link to="/create/post">Send new post</Link></p>
                </div>

                {(Object.keys(this.props.subreddit).length > 0 && this.props.subreddit && this.props.showActiveSubreddit) && (
                    <div>
                        <div className="box">
                            <p className="has-text-weight-semibold is-uppercase">r/{this.props.subreddit.name}</p>
                            <p>{this.props.subreddit.description}</p>
                            {('moderators' in this.props.subreddit) && (
                                this.props.subreddit.moderators.length > 0 && (
                                    <div>
                                        <p className="has-text-weight-semibold is-uppercase">Moderators</p>
                                        <ul>
                                            {this.props.subreddit.moderators.map(mod => {
                                                return (
                                                    <li key={mod.id}>{mod.user.username}</li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
                {this.state.mod !== false && (
                    <div>
                        <div className="box">
                            <p className="has-text-weight-semibold has-text-centered">
                                You are {this.state.mod.title}.<br/>
                                Click <Link to={"/r/" + this.props.subreddit.name + "/mod"}>here</Link> to view options.
                            </p>
                        </div>                    
                    </div>
                )}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    subreddit: state.subreddits.active,
    user: state.users.user
});

export default connect(mapStateToProps, null)(LinksSidebar);