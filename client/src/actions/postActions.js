import { POST } from './types';
import axios from 'axios';
import async from 'async';
import Auth from 'modules/Auth';

export const fetchHomePosts = (page) => async (dispatch) => {
    dispatch({ type: POST.FETCH_POST_LIST_PENDING });
    
    // Get the user before we get the posts so we can get their user votes if thereis any
    var user = Auth.isUserAuthenticated ? await Auth.getUser() : undefined;

    let url = user === undefined ? (
        '/api/posts/home?p='+page
    ) : '/api/posts/home?p='+page+'&u='+user.id;

    axios.get(url).then(results => {
        var posts = results.data.posts;
        // Treat each post
        async.each(posts, (post, callback) => {
            post.instance = "post";
            post.totalVotes = post.upVotes - post.downVotes;
            // The back end sends username and user ID so we can append it to each post's data
            post.user = {};
            post.user.username = post.username;
            post.user.id = post.userId;
            post.canVote = user !== null && user !== undefined && post.suspension !== 1;
            post.userVote = (post.userVote === null || post.userVote === undefined) ? 0 : post.suspension !== 1 ? post.userVote : 0;
            callback();
        }, () => {
            // All posts are processed.
            dispatch({
                type: POST.FETCH_POST_LIST_SUCCESS,
                payload: {
                    posts: posts,
                    pagedata: results.data.pagedata
                }
            });
        });
    }).catch(error => { dispatch({ type: POST.FETCH_POST_LIST_FAILURE }) });
}

export const fetchPosts = (subreddit, page) => async (dispatch) => {
    
    dispatch({ type: POST.FETCH_POST_LIST_PENDING });
    // Get the user before we get the posts so we can get their user votes if thereis any
    var user = Auth.isUserAuthenticated ? await Auth.getUser() : undefined;

    let url = user === undefined ? (
        '/api/posts/' + subreddit + '?p='+page
    ) : '/api/posts/' + subreddit + '?p='+page+'&u='+user.id;

    axios.get(url).then(results => {
        var posts = results.data.posts;
        // Treat each post
        async.each(posts, (post, callback) => {
            post.instance = "post";
            post.totalVotes = post.upVotes - post.downVotes;
            // The back end sends username and user ID so we can append it to each post's data
            post.user = {};
            post.user.username = post.username;
            post.user.id = post.userId;
            post.canVote = user !== undefined && user !== null && post.suspension !== 1;
            post.userVote = (post.userVote === undefined || post.userVote === null) ? 0 : post.suspension !== 1 ? post.userVote : 0;
            
            callback();
        }, () => {
            // All posts are processed.
            dispatch({
                type: POST.FETCH_POST_LIST_SUCCESS,
                payload: {
                    posts: posts,
                    pagedata: results.data.pagedata
                }
            });
        });

    }).catch(error => {
        console.log('Error: ', error.response);
        dispatch({ type: POST.FETCH_POST_LIST_FAILURE }); // Error fetching posts
    });
}

export const fetchPost = (postId) => dispatch => {
    dispatch({ type: POST.FETCH_POST_SINGLE_PENDING });
    axios.get('/api/post/'+postId).then(async post => {
        // We need the user to get the postvotes for this user. 'user' can be undefined if unauthorized
        var user = Auth.isUserAuthenticated() ? await Auth.getUser() : undefined;
        var suspended = false;

        if(user !== undefined && 'id' in user) {
            // Check for suspensions
            let suspensions = post.data.subreddit.suspensions;
            for(var i = 0; i < suspensions.length; i++) {
                if(suspensions[i].userId === user.id) {
                    suspended = true;
                    break;
                }
            }
        }
        axios.get('/api/post/'+postId+'/votes').then(votedata => {
            // Add new data pertinent to this
            post.data.totalVotes = votedata.data.total;
            post.data.userVote = 0;
            post.data.instance = "post";

            // If user is logged in, we get their user-votes for each post
            if(Auth.isUserAuthenticated()) {
                // If user is suspended, they cannot vote no matter what                
                post.data.canVote = suspended === false ? true : false;
                // This also means that we don't need to get their vote because they can't change it anyway
                if(suspended === false) {
                    axios.get('/api/votes/post/'+post.data.id+'/'+user.id).then(userVote => {
                        post.data.userVote = userVote.data !== null ? userVote.data.value : 0;
                        dispatch({ type: POST.FETCH_POST_SINGLE_SUCCESS, payload: post.data });
                    }).catch(error => { 
                        console.log('Error: ', error);
                        dispatch({ type: POST.FETCH_POST_SINGLE_FAILURE });
                    });
                } else {
                    post.data.userVote = 0;
                    post.data.canVote = false;
                    dispatch({ type: POST.FETCH_POST_SINGLE_SUCCESS, payload: post.data });
                }
            } else {
                post.data.canVote = false;
                dispatch({ type: POST.FETCH_POST_SINGLE_SUCCESS, payload: post.data });
            }
        }).catch(error => {
            console.log('Error: ', error);
            dispatch({ type: POST.FETCH_POST_SINGLE_FAILURE }); // Error fetching vote data
        });
    }).catch(error => {
        console.log('Error: ', error);
        dispatch({ type: POST.FETCH_POST_SINGLE_FAILURE });
    })
}

export const createPostVote = (postId, prevUserVote, value) => dispatch => {
    dispatch({ type: POST.VOTE_POST_PENDING, voted: postId });
    axios.post('/api/votes/post', {postId: postId, token: Auth.getToken(), value: value}, {headers: Auth.getApiAuthHeader()}).then(results => {
        dispatch({ type: POST.VOTE_POST_SUCCESS, voted: postId, prevUserVote: prevUserVote, value: value });
    }).catch(error => {
        console.log('Error: ', error.response);
        dispatch({ type: POST.VOTE_POST_FAILURE, voted: postId }); // Error sending POST vote
    });
}

export const resetPost = () => dispatch => {
    dispatch({ type: POST.RESET_POST });
}