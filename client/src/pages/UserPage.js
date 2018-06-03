import React, { Component } from 'react';
import { connect } from 'react-redux';
import Loading from 'components/Loading';
import axios from 'axios';
import { Link } from 'react-router-dom';

class UserPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            user: undefined
        }
    }

    componentDidMount() {
        axios.get('/api/user/'+this.props.match.params.user).then(user => {
            this.setState({ user: user.data, loading: false });
        }).catch(error => {
            console.log('Error; ', error);
        });
    }

    render() {
        let submissions = (this.state.user !== undefined) && this.state.user.posts.map(post => {
            let url = post.link === null ?
                "/r/" + post.subreddit + "/" + post.id + "/" + post.slug
            : post.link;
            return (
                <div className="box" key={post.id}>
                    <div className="columns is-desktop is-vcentered">
                        <div className="column is-narrow">
                            <p>{post.votes || 0}</p>
                        </div>
                        <div className="column">
                            <h4 className="is-4 has-text-weight-semibold">
                                <Link to={url} style={{color: '#6b6b6b'}}>
                                    {post.title}
                                </Link>
                            </h4>
                            <small className="has-text-weight-semibold">
                                <span className="has-text-weight-semibold">
                                    <span>Posted in </span>
                                    <Link to={"/r/"+post.subreddit} style={{color:'#6b6b6b'}}>
                                        r/{post.subreddit}
                                    </Link>
                                </span>
                            </small>
                            <p>{post.text.substring(0,256).concat(post.text.length >= 255 ? '...' : '')}</p>
                            
                            <p>
                                <Link style={{color: 'inherit'}} to={url}>
                                    <small className="has-text-weight-semibold is-uppercase is-size-7">
                                        View comments ({post.commentCount})
                                    </small>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )
        });

        return (
            this.state.loading === true ? (
                <Loading/>
            ) : (
                this.state.user.undefined === true ? (
                    <p className="has-text-weight-semibold is-uppercase">This user does not exist.</p>
                ) : (
                    <div>
                        <div className="box">
                            <h3 className="has-text-weight-semibold is-3">
                                <span className="icon">
                                    <Link to={"/dm/send/" + this.state.user.username} style={{color: 'inherit'}} aria-label={"Send message to " + this.state.user.username} alt={"Send message to " + this.state.user.username}>
                                        <i className="fa fa-envelope"></i>
                                    </Link>
                                </span>
                                <span>{this.state.user.username}</span>
                            </h3>

                            <p>Joined in {this.state.user.createdAtFormatted}</p>
                            <p>{this.state.user.username} has received <strong>{this.state.user.karma}</strong> karma points</p>
                        </div>
                        
                        <div className="box">
                            <h4 className="has-text-weight-semibold is-4 is-uppercase">Submissions</h4>
                            <hr/>
                            {submissions}
                        </div>
                    </div>
                )
            )
        )   
    }
}

const mapStateToProps = state => ({
    user: state.users.user
});

export default connect(mapStateToProps, null)(UserPage);