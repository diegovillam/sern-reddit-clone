import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createPostVote } from 'actions/postActions';
import { createCommentVote } from 'actions/commentActions';

class VoteBox extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.sendingCommentVote !== nextProps.sendingCommentVote || this.props.sendingPostVote !== nextProps.sendingPostVote) {
            // Should update only if the props are changing
            return true;
        }
        return false;
    }
    render() {
        const upvote = 
            <span className="icon">
                <i className="fa fa-plus"></i>
            </span>;

        const downvote = <span className="icon">
                <i className="fa fa-minus"></i>
            </span>;

        let instance = this.props.active.post || this.props.active.comment || undefined;
        //console.log('Can this votebox participate?',this.props.canParticipate);
        return (
            instance.instance === 'post' ? (
                <div>
                    {(this.props.canParticipate !== false) && (
                        instance.userVote !== 1 ? (
                            <a onClick={() => this.props.createPostVote(instance.id, instance.userVote || 0, 1)}>
                                {upvote}
                                <br/>
                            </a>
                        ) : (
                            <div>
                                {upvote}
                                <br/>
                            </div>
                        )
                    )}

                    {(this.props.sendingPostVote !== instance.id) ? (
                        <span>{instance.totalVotes || 0}</span>
                    ) : (
                        <span style={{color: '#acacac'}}>{instance.totalVotes || 0}</span>
                    )}

                    <br/>
                    {(this.props.canParticipate !== false) && (
                        instance.userVote !== -1 ? (
                            <div>
                                <a onClick={() => this.props.createPostVote(instance.id, instance.userVote || 0, -1)}>{downvote}</a>
                                <br/>
                            </div>
                        ) : (   
                            <div>
                                {downvote}<br/>
                            </div>
                        )
                    )}
                </div>
            ) : ( // Instance is 'comment' 
                <div>
                    {/* Votebox for comment */}
                    {(this.props.canParticipate !== false) && (
                        instance.userVote !== 1 ? (
                            <a onClick={() => this.props.createCommentVote(instance.id, instance.userVote || 0, 1)}>
                                {upvote}
                                <br/>
                            </a>
                        ) : (
                            <div>
                                {upvote}
                                <br/>
                            </div>
                        )
                    )}

                    {(this.props.sendingCommentVote !== instance.id) ? (
                        <span>{instance.totalVotes || 0}</span>
                    ) : (
                        <span style={{color: '#acacac'}}>{instance.totalVotes || 0}</span>
                    )}

                    <br/>
                    {(this.props.canParticipate !== false) && (
                        instance.userVote !== -1 ? (
                            <div>
                                <a onClick={() => this.props.createCommentVote(instance.id, instance.userVote || 0, -1)}>{downvote}</a>
                                <br/>
                            </div>
                        ) : (   
                            <div>
                                {downvote}<br/>
                            </div>
                        )
                    )}
                </div>
            )
        )
    }
}

const mapStateToProps = state => ({
    sendingPostVote: state.posts.sendingPostVote,
    sendingCommentVote: state.comments.sendingCommentVote
});

export default connect(mapStateToProps, { createPostVote, createCommentVote })(VoteBox);