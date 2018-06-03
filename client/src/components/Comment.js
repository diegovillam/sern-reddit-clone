import React, { Component } from 'react';
import VoteBox from 'components/VoteBox';
import NewCommentBox from 'components/NewCommentBox';
import { connect } from 'react-redux';
import { fetchMoreComments } from 'actions/commentActions';
import { Link } from 'react-router-dom';

class Comment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isReplyToComment: false,
            loadingMore: false
        }
        this.togCommentReply = this.togCommentReply.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }   

    togCommentReply() {
        this.setState({ isReplyToComment: !this.state.isReplyToComment });
    }

    loadMore() {
        let { data } = this.props;
        this.setState({ loadingMore: true });
        this.props.fetchMoreComments(data.postId, data.id);
    }

    render() {
        const { data, children } = this.props;
        return (
            <li>
                <div className="columns is-mobile">
                    <div className="column is-narrow has-text-centered">
                        <VoteBox 
                            active={{ comment: data }}
                            canParticipate={this.props.canParticipate}
                        />
                    </div>
                    <div className="column">
                        
                        <p>{data.text}</p>

                        <small className="has-text-weight-semibold is-size-7">
                            {data.createdAtFormatted} | 
                            <Link style={{color:'inherit'}} to={'/u/'+data.username}> By {data.username} </Link>
                        </small>

                        <small className="has-text-weight-semibold is-size-7">
                            |
                            <a onClick={this.togCommentReply}> Reply </a>
                        </small>

                        {data.remainingChildren > 0 && (
                            this.state.loadingMore === false ? (
                                <small className="has-text-weight-semibold is-size-7">
                                    |
                                    <a onClick={this.loadMore}> View {data.remainingChildren} more replies</a>
                                </small>
                            ) : (
                                <small className="has-text-weight-semibold is-size-7">
                                    |
                                    <span style={{color: '6b6b6b'}}> Loading {data.remainingChildren} more replies</span>
                                </small>
                            )
                        )}

                        {this.state.isReplyToComment === true && (
                            <NewCommentBox 
                                reply={data.id}
                                onCancel={this.togCommentReply}
                            />
                        )}
                    </div>
                </div>
                
                {children.length > 0 && (
                    <ul>
                        {children.map((child,x) => {
                            return (
                                <Comment
                                    key={x}
                                    data={child}
                                    children={child.children}
                                    fetchMoreComments={this.props.fetchMoreComments}
                                />
                            )
                        })}
                    </ul>
                )}
            </li>
        )
    }
}

const mapStateToProps = state => ({
    // Add a random element to force a re-render everytime we get a new update
    // React does not re-render if the changes in the props are deeply nested
    random: state.comments.random
});

export default connect(mapStateToProps, { fetchMoreComments })(Comment);