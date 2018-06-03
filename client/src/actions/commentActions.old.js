import { COMMENT } from './types';
import axios from 'axios';
import async from 'async';
import Auth from 'modules/Auth';

async function sortAll(nodes) {
    return new Promise(async (resolve, reject) => {
        // Sort by score in descending order
        await (nodes.sort((a, b) => { return a.score > b.score ? -1 : 1; }));
        async.each(nodes, (leaf, callback) => {
            //console.log('Sorting children: ', nodes.children);
            sortBranch(leaf).then(() => callback());
        }, () => {
            resolve(nodes);
        });
    });
}
async function sortBranch(nodes) {
    nodes.children.sort((a, b) => { return (a.score > b.score ? -1 : 1); });
    // Sort each children collection if it has more than 1
    await Promise.all(nodes.children.map(c => c.length > 1 && sortBranch(c)));
}

async function updateNode(node) {
    //axios.get('/api/comment/'+node.id+'/votes'), // No longer needed since is acquired from API directly
    await axios.get('/api/votes/comment/'+node.id+'/'+Auth.getToken(), { headers: Auth.getApiAuthHeader() }).then(uservote => {
        node.totalVotes = node.upvotes - node.downvotes;
        node.instance = 'comment';
        //node.canVote = Auth.isUserAuthenticated();
        
        if(uservote) {
            node.userVote = uservote.data.value;
        }
    }).catch(error => {
        console.log('Error getting user vote data: ', error)
    });
}
async function updateNodeRecursively(node) {
    // Update this node then solve all the promises created by itself upon the children (recursive)
    await updateNode(node);
    await Promise.all(node.children.map(updateNodeRecursively));
}
async function updateAllNodes(nodes) {
    return new Promise((resolve, reject) => {
        // For all the leaf nodes, update their nodes recursively
        async.each(nodes, (node, callback) => {
            updateNodeRecursively(node).then(() => callback() );
        }, () => {
            resolve(nodes);
        });
    });
}

export const fetchComments = (postId) => dispatch => {
    dispatch({ type: COMMENT.FETCH_COMMENT_LIST_PENDING });
    return axios.get('/api/comments/'+postId).then(comments => {
        // Expand the nodes with extra vote data and dispatch
        updateAllNodes(comments.data).then(comments => { 
            sortAll(comments).then(comments => {
                // each comment no longer contains canVote as of 05/27 because the flag is now passed on to the
                // comments component from the PostPage, based on whether the user state is contained in the suspensions state for the current post
                dispatch({ 
                    type: COMMENT.FETCH_COMMENT_LIST_SUCCESS, 
                    payload: comments 
                });
            });
         });
    }).catch(error => {
        console.log('Error fetching comments: ', error, error.response);
        dispatch({ type: COMMENT.FETCH_COMMENT_LIST_FAILURE }); // Error fetching post list
    });
}

export const fetchMoreComments = (postId, parent) => dispatch => {
    dispatch({ type: COMMENT.FETCH_MORE_COMMENTS_PENDING });
    return axios.get('/api/comments/'+postId+'?p='+parent).then(children => {
        updateAllNodes(children.data).then(children => {
            sortAll(children).then(children => {
                console.log('More children: ', children);
                dispatch({ 
                    type: COMMENT.FETCH_MORE_COMMENTS_SUCCESS, 
                    payload: {children: children, parent: parent} 
                });
            });
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