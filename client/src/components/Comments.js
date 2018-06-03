import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchComments } from 'actions/commentActions';
import Loading from 'components/Loading';
import Comment from 'components/Comment';

class Comments extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 0
        }
        this.getMoreComments = this.getMoreComments.bind(this);
    }

    componentDidMount() {
        this.props.fetchComments(this.props.post, this.state.page);
    }

    getMoreComments() {
        this.props.fetchComments(this.props.post, this.state.page + 1);
        this.setState({ page: this.state.page + 1 });
    }

    render() {
        // Get the root comments
        console.log('comments',this.props.comments);
        const comments = this.props.loading === false && (
            this.props.comments.map((comment,x)=> {
                console.log('comment '+x, comment);
                return (
                    <div key={x}>
                        <Comment 
                            data={comment} 
                            children={comment.children}
                            canParticipate={this.props.canParticipate}
                        />
                    </div>
                )
            })
        );

        return (
            this.props.loading === true ? (
                <Loading/>
            ) : (
                this.props.comments.length > 0 ? (
                    <div>
                        <ul>
                            {comments}
                        </ul>
                        <hr/>
                        {this.props.pagedata.hasNext === true && (
                            <a onClick={this.getMoreComments}>Load more comments</a>    
                        )}
                    </div>
                ) : (
                    <h5 className="is-5 has-text-weight-semibold">
                        No comments exist yet for this post.
                    </h5>
                )
            )
        )
    }
}

const mapStateToProps = state => ({
    comments: state.comments.comments,
    pagedata: state.comments.pagedata,
    loading: state.comments.loading,
    // Add a random element to force a re-render everytime we get a new update
    // React does not re-render if the changes in the props are deeply nested
    random: state.comments.random
});

export default connect(mapStateToProps, { fetchComments })(Comments);