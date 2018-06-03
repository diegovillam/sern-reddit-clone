import { COMMENT } from './types';
import axios from 'axios';
import async from 'async';
import Auth from 'modules/Auth';

export const fetchComments = (postId, page) => async (dispatch) => {
    var user = Auth.isUserAuthenticated ? await Auth.getUser() : undefined;
    let url = user === undefined ? (
        '/api/comments/' + postId + '?o=' + page
    ) : '/api/comments/' + postId + '?o=' + page + '&u=' + user.id;

    dispatch({ type: COMMENT.FETCH_COMMENT_LIST_PENDING, page: page });
    return axios.get(url).then(comments => {
        dispatch({ 
            type: COMMENT.FETCH_COMMENT_LIST_SUCCESS, 
            payload: comments.data.comments,
            pagedata: comments.data.pagedata
        });
    }).catch(error => {
        console.log('Error fetching comments: ', error, error.response);
        dispatch({ type: COMMENT.FETCH_COMMENT_LIST_FAILURE }); // Error fetching post list
    });
}//

export const fetchMoreComments = (postId, parent) => async (dispatch) => {
    var user = Auth.isUserAuthenticated ? await Auth.getUser() : undefined;
    let url = user === undefined ? (
        '/api/comments/' + postId + '?p=' + parent
    ) : '/api/comments/' + postId + '?p=' + parent + '&u=' + user.id;

    dispatch({ type: COMMENT.FETCH_MORE_COMMENTS_PENDING });
    return axios.get(url).then(children => {
        dispatch({ 
            type: COMMENT.FETCH_MORE_COMMENTS_SUCCESS, 
            payload: {children: children.data, parent: parent} 
        });
    }).catch(error => {
        dispatch({ type: COMMENT.FETCH_MORE_COMMENTS_FAILURE });
    });
}

export const createCommentVote = (commentId, prevUserVote, value) => dispatch => {
    dispatch({ type: COMMENT.VOTE_COMMENT_PENDING, voted: commentId });
    axios.post('/api/votes/comment', {commentId: commentId, token: Auth.getToken(), value: value}, {headers: Auth.getApiAuthHeader()}).then(results => {
        // We send the user vote so we know if we have to "adjust" the vote counter
        dispatch({ type: COMMENT.VOTE_COMMENT_SUCCESS, prevUserVote: prevUserVote || 0, voted: commentId, value: value });
    }).catch(error => {
        console.log('Error creating comment vote: ', error);
        dispatch({ type: COMMENT.VOTE_COMMENT_FAILURE, voted: commentId }); // Error sending POST vote
    });
}

export const createComment = (parent, post, text) => dispatch => {
    dispatch({ type: COMMENT.NEW_COMMENT_PENDING, parent: parent });
    // We send the token so that it can be converted to an 'user id' at the back end
    axios.post('/api/comment', {parent: parent, post: post, text: text, token: Auth.getToken()}, {headers: Auth.getApiAuthHeader()}).then(results => {

        results.data.children = []; // This comment is new so it cannot have kids
        results.data.userVote = 0; // User hasn't voted on it yet
        results.data.totalVotes = 0; // It starts with 0 votes
        results.data.instance = 'comment'; // It's a comment
        results.data.canVote = true; // Can vote, because how else did we create it?

        dispatch({ type: COMMENT.NEW_COMMENT_SUCCESS, payload: results.data });
    }).catch(error => {
        console.log('Error creating comment: ', error, error.response);
        dispatch({ type: COMMENT.NEW_COMMENT_FAILURE });
    });
}