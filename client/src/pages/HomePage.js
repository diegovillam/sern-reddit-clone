import React, { Component } from 'react';
import { fetchHomePosts } from 'actions/postActions';
import { connect } from 'react-redux';
import Loading from 'components/Loading';
import PostLink from 'components/PostLink';
import Pagination from 'components/Pagination';

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.updateData = this.updateData.bind(this);
    }

    componentDidMount() {
        this.updateData();
    }
    
    updateData(newPage = undefined) {
        let page = (newPage === undefined) ?
                this.props.location.search.includes("p=") ? this.props.location.search.split("p=").pop() : undefined
            : newPage;
        this.props.fetchHomePosts(page || 0);
    }

    render() {
        const posts = (this.props.loading === false && this.props.posts.length > 0) ? this.props.posts.map(post => {
            return (
                <div key={post.id}>
                    <PostLink
                        url={'r/' + post.subreddit + '/' + post.id + '/' + post.slug}
                        subreddit={post.subreddit}
                        post={post}
                    />
                </div>
            )
        }) : (
            <p>No content yet</p>
        );

        return (
            this.props.loading === true ? (
                <Loading/>
            ) : (
                <div>
                    {posts}
                    <Pagination
                        previous={{
                            available: this.props.page.hasPrevious,
                            url: '?p='+(this.props.page.current-1)
                        }}
                        next={{
                            available: this.props.page.hasNext,
                            url: '?p='+(this.props.page.current+1)
                        }}
                        onChangePage={this.updateData}
                        current={this.props.page.current}
                    />
                </div>
            )
        )
    }
}

const mapStateToProps = state => ({
    loading: state.posts.loading,
    posts: state.posts.posts,
    page: state.posts.page
});

export default connect(mapStateToProps, { fetchHomePosts })(HomePage);