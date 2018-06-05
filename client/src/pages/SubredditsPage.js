import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchSubreddits } from 'actions/subredditActions';
import Loading from 'components/Loading';
import LinksSidebar from 'components/LinksSidebar';
import Pagination from 'components/Pagination';

class SubredditsPage extends Component {
    constructor(props) {
        super(props);
        this.updateData = this.updateData.bind(this);
        this.onSearchSubreddit = this.onSearchSubreddit.bind(this);
    }

    componentWillMount() {
        this.updateData();
    }

    updateData(newPage = undefined, search = undefined) {
        let sub = this.props.match.params.subreddit;
        let page = (newPage === undefined) ?
            this.props.location.search.includes("p=") ? this.props.location.search.split("p=").pop() : undefined
            : newPage;
        
        search = (search === undefined) ?
            this.props.location.search.includes("q=") ? this.props.location.search.split("q=").pop() : undefined
            : search;
        
        this.props.fetchSubreddits(page || 0, search);
    }

    onSearchSubreddit(page, search) {
        this.props.history.push('/r?q='+search);
        this.updateData(0, search);
    }

    render() {
        const subreddits = this.props.subreddits.length > 0 ? 
            this.props.subreddits.map(subreddit => {
                return (
                    <div key={subreddit.id}>
                        <h5><Link to={'/r/'+subreddit.name}>{subreddit.name}</Link></h5>
                        <p>{subreddit.description}</p>
                    </div>
                )
            })
        : (
            <p className="has-text-weight-semibold">No subreddits found matching that criteria.</p>
        )

        return (
            <div className="columns">
                <div className="column is-9 is-pulled-left">
                    {this.props.loading === true ? (
                        <Loading/>
                    ) : (
                        <div>
                            <p className="has-text-weight-semibold is-uppercase">Subreddits</p>
                            {subreddits}
                            <hr/>
                            <Pagination
                                previous={{
                                    available: this.props.page.hasPrevious,
                                    url: '/r?p='+(this.props.page.current-1)
                                }}
                                next={{
                                    available: this.props.page.hasNext,
                                    url: '/r?p='+(this.props.page.current+1)
                                }}
                                onChangePage={this.updateData}
                                current={this.props.page.current}
                            />
                        </div>
                    )}
                </div>
                <div className="column is-3 is-pulled-right">
                    <LinksSidebar 
                        showActiveSubreddit={false}
                        onSearchSubreddit={this.onSearchSubreddit}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    subreddits: state.subreddits.subreddits,
    loading: state.subreddits.loading,
    page: state.subreddits.page
});

export default connect(mapStateToProps, { fetchSubreddits })(SubredditsPage);
