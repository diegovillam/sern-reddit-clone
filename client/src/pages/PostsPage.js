import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPosts, createPostVote } from 'actions/postActions';
import { getSubreddit } from 'actions/subredditActions';
import Loading from 'components/Loading';
import { Link } from 'react-router-dom';
import LinksSidebar from 'components/LinksSidebar';
import Pagination from 'components/Pagination';
import PostLink from 'components/PostLink';

class PostsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            exists: undefined,
            storedMessage: ''
        }
        const message = localStorage.getItem('message');
        if(message) {
            this.state.storedMessage = message;
            localStorage.removeItem('message');
        }
        this.updateData = this.updateData.bind(this);
    }

    componentWillMount() {
        this.updateData();
    }

    updateData(newPage = undefined) {
        let sub = this.props.match.params.subreddit;
        let page = (newPage === undefined) ?
                this.props.location.search.includes("p=") ? this.props.location.search.split("p=").pop() : undefined
            : newPage;
        
        // First get the subreddit with this param
        this.props.getSubreddit(sub).then(() => {
            // If the prop isn't active after the promise is complete it means this sub doesn't exist
            if(this.props.active === null) {
                this.setState({ exists: false });
            } else {
                // The sub exists, we can get data from it now from the page or the default page
                this.setState({ exists: true });
                this.props.fetchPosts(sub, page || 0);
            }
        });
    }
    
    render() {
        const posts = this.props.active !== null && this.props.posts.length > 0 ? this.props.posts.map(post => {
            return (
                <div key={post.id}>
                    <PostLink
                        url={"/r/"+this.props.active.name+"/"+post.id+"/"+post.slug}
                        post={post}
                    />
                </div>
            )
        }) : (
            <p>No content yet</p>
        );
        return (
            
            (this.props.loadingSubreddit === true || this.props.loadingPosts === true) ? (
                <Loading/>
            ) : (
                this.state.exists === false ? (
                    <div>
                        <h4>This subreddit doesn't exist.</h4>
                        <p>You can <Link to={"/create/" +  this.props.match.params.subreddit}>create it.</Link></p>
                    </div>
                ) : (
                    <div>
                        {this.state.storedMessage && (
                            <div className="notification is-success">
                                {this.state.storedMessage}
                            </div>
                        )}
                        <div className="columns">
                            <div className="column is-9">
                                <p className="is-uppercase has-text-weight-semibold">You are currently navigating <span className="is-lowercase">r/</span>{this.props.active.name}</p>
                                <hr/>
                                {posts}
                                <Pagination
                                    previous={{
                                        available: this.props.page.hasPrevious,
                                        url: '/r/'+this.props.active.name+'?p='+(this.props.page.current-1)
                                    }}
                                    next={{
                                        available: this.props.page.hasNext,
                                        url: '/r/'+this.props.active.name+'?p='+(this.props.page.current+1)
                                    }}
                                    onChangePage={this.updateData}
                                    current={this.props.page.current}
                                />
                            </div>

                            <div className="column is-3">
                                <LinksSidebar showActiveSubreddit={true}/>
                            </div>
                        </div>
                    </div>    
                )
            )
        )
    }
}

const mapStateToProps = state => ({
    active: state.subreddits.active,
    loadingSubreddit: state.subreddits.loading,
    posts: state.posts.posts,
    loadingPosts: state.posts.loading,
    page: state.posts.page
});

export default connect(mapStateToProps, { fetchPosts, getSubreddit, createPostVote })(PostsPage);