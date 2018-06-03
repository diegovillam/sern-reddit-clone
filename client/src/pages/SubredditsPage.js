import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchSubreddits } from 'actions/subredditActions';
import Loading from 'components/Loading';
import LinksSidebar from 'components/LinksSidebar';

class SubredditsPage extends Component {
    componentWillMount() {
        this.props.fetchSubreddits();
    }

    render() {
        const subreddits = this.props.subreddits.map(subreddit => {
            return (
                <div key={subreddit.id}>
                    <h5><Link to={'/r/'+subreddit.name}>{subreddit.name}</Link></h5>
                    <p>{subreddit.description}</p>
                </div>
            )
        });

        return (
            this.props.loading === true ? (
                <Loading/>
            ) : (
                <div className="columns">
                    <div className="column is-9 is-pulled-left">
                        <p className="has-text-weight-semibold is-uppercase">Subreddits</p>
                        {subreddits}
                    </div>
                    <div className="column is-3 is-pulled-right">
                        <LinksSidebar showActiveSubreddit={false}/>
                    </div>
                </div>
            )
        )
    }
}

const mapStateToProps = state => ({
    subreddits: state.subreddits.subreddits,
    loading: state.subreddits.loading
});

export default connect(mapStateToProps, { fetchSubreddits })(SubredditsPage);
