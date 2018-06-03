import React, { Component } from 'react';
import VoteBox from 'components/VoteBox';
import { Link } from 'react-router-dom';

export default class PostLink extends Component {
    render () {
        let { post } = this.props;

        return (
            <div className="columns is-vcentered is-mobile">
                <div className="column is-narrow has-text-centered">
                    <VoteBox 
                        active={{post: post}}
                        canParticipate={post.canVote}
                    />
                </div>

                <div className="column">
                    {(!post.link || post.link === undefined || post.link.length === 0) ? (
                        <p><Link to={this.props.url}>{post.title}</Link></p>
                    ) : (
                        <p><a href={post.link}>{post.title}</a></p>
                    )}
                    {this.props.subreddit && (
                        <Link style={{color: 'inherit'}} to={'/r/'+this.props.subreddit}>
                            <small className="has-text-weight-bold is-size-7">
                                In r/{this.props.subreddit}
                            </small>
                        </Link>
                    )}
                    <p>
                        <small className="has-text-weight-semibold is-size-7">
                            <span className="is-uppercase">Sent by </span><Link to={"/u/"+post.user.username} style={{color: '#6b6b6b'}}><span className="is-lowercase">u/</span>{post.user.username}</Link>
                        </small>
                    </p>

                    <p>
                        <Link style={{color: 'inherit'}} to={this.props.url}>
                            <small className="has-text-weight-semibold is-uppercase is-size-7">
                                View comments ({post.commentCount})
                            </small>
                        </Link>
                    </p>
                </div>
            </div>
        )
    }
}