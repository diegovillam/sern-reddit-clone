import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchPost } from 'actions/postActions';
import Loading from 'components/Loading';
import VoteBox from 'components/VoteBox';
import NewCommentBox from 'components/NewCommentBox'
import Comments from 'components/Comments';

class PostPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCommentBox: true,
            canParticipate: true
        }
        this.toggleCommentBox = this.toggleCommentBox.bind(this);
    }

    toggleCommentBox() {
        this.setState({ hideCommentBox: !this.state.hideCommentBox });
    }

    componentDidMount() {
        this.props.fetchPost(this.props.match.params.post);
    }

    // When we get the post from fetchPost, we want to determine if this user is suspended
    componentWillReceiveProps(nextProps, nextContext) {
        if('post' in nextProps && Object.keys(nextProps.post).length > 0) {
           this.setState({ canParticipate: nextProps.post.canVote });
        }
    }
    
    render() {
        return (
            this.props.loading === true ? (
                <Loading/>
            ) : (
                (this.props.post !== undefined && this.props.post !== null && this.props.post.subreddit !== undefined) ? (
                    <div>
                        <Link to={'/r/'.concat(this.props.post.subreddit.name)} style={{color: 'inherit'}}>
                            <p className="has-text-weight-semibold">
                                Return to <span className="is-lowercase"> r/</span>{this.props.post.subreddit.name}
                            </p>
                        </Link>                            
                        <hr/>
                        <div className="box" style={{paddingBottom: '10px'}}>
                            <div className="columns is-vcentered is-mobile" style={{paddingBottom: '0'}}>
                                <div className="column is-narrow has-text-centered">
                                    <VoteBox 
                                        active={{post: this.props.post}}
                                        canParticipate={this.state.canParticipate}
                                    />
                                </div>
                                <div className="column">
                                    <h5 className="has-text-weight-semibold is-5" style={{marginBottom: '0'}}>
                                        {this.props.post.title}
                                    </h5>
                                    <small className="has-text-weight-semibold">
                                        By 
                                        <Link to={'/u/' + this.props.post.user.username} style={{color: 'inherit'}}> u/<span>{this.props.post.user && this.props.post.user.username}</span></Link>
                                        <br/><span className="has-text-weight-normal">{this.props.post.createdAtFormatted}</span>
                                    </small>
                                </div>
                            </div>

                            <div className="container-fluid">
                                <p style={{marginTop: '1rem'}}>
                                    {this.props.post.text}
                                </p>
                            </div>
                        </div>
                        <div className="box">
                            <h5 className="is-uppercase has-text-weight-semibold is-5">Comments</h5>
                            {this.state.canParticipate === true && (
                                <div>
                                    <small className="has-text-weight-semibold is-size-7">
                                        <a className="black" onClick={this.toggleCommentBox}>Leave a comment</a>
                                    </small>
                                    {this.state.hideCommentBox === false && (
                                        <NewCommentBox
                                            onCancel={this.toggleCommentBox}
                                        />
                                    )}
                                </div>
                            )}
                            
                            {/* Due to the async nature of getting 'this.props.post', we will pass the params from the URI as the prop 
                                Do not change the prop below to 'this.props.id' */}
                            <div style={{marginTop:'20px'}}>
                                <Comments 
                                    post={this.props.match.params.post}
                                    canParticipate={this.state.canParticipate}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <h2>Post not found</h2>
                )
            )
        )
    }
}

const mapStateToProps = state => ({
    user: state.users.user,
    post: state.posts.post,
    loading: state.posts.loading
});

export default connect(mapStateToProps, { fetchPost })(PostPage);