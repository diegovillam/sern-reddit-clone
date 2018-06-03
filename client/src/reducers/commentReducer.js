import { COMMENT } from '../actions/types';
import Util from 'modules/Util';

const initialState = {
    comments: [],
    pagedata: {},
    loading: false,
    sendingCommentVote: 0,
    loadingMoreComments: 0,
    creatingNewComment: undefined, // Comment ID to which is replying
    random: 0
};

export default function(state = initialState, action) {
    switch(action.type) {
        case COMMENT.FETCH_COMMENT_LIST_PENDING: {
            // If the page is 0, we need to display loading.
            // Else, we don't need to display loading because the comments are appended to the already existing ones
            let loading = action.page === 0 ? true: false;
            return {
                ...state,
                loading: loading
            }
        }
        case COMMENT.FETCH_COMMENT_LIST_SUCCESS: {
            
            // This will add the payload to the current comments set (empty or not)
            let comments = state.comments;
            Array.prototype.push.apply(comments, action.payload);

            return {
                ...state,
                comments: comments,
                pagedata: action.pagedata,
                loading: false
            }
        }
        case COMMENT.FETCH_COMMENT_LIST_FAILURE: {
            return {
                ...state,
                loading: false
            }
        }

        case COMMENT.FETCH_MORE_COMMENTS_PENDING: {
            return { 
                ...state,
            }
        }
        case COMMENT.FETCH_MORE_COMMENTS_SUCCESS: {
            let { children, parent } = action.payload;

            // Recursively find the node matching the parent sent in the action
            // And adjust its children
            let comments = state.comments;
            for(let i = 0; i < state.comments.length; i++) {
                let c = Util.searchTree(comments[i], parent);
                if(c !== null && c) {
                    c.remainingChildren = 0;
                    c.children = children;
                }
            }
            return { 
                ...state,
                comments: comments,
                // Add a random element so the components listening to this reducer "think" there was an update and force a re-render
                // React does not re-render if the changes in the props are deeply nested so this is just a hack
                random: Math.random()
            }
        }
        case COMMENT.FETCH_MORE_COMMENTS_FAILURE: {
            return { 
                ...state,
            }
        }

        case COMMENT.VOTE_COMMENT_PENDING: {
            return { 
                ...state,
                sendingCommentVote: action.voted
            }
        }
        case COMMENT.VOTE_COMMENT_SUCCESS: {
            
            // Recursively find the node matching the ID sent in the action
            // And adjust its vote data
            let comments = state.comments;
            for(let i = 0; i < state.comments.length; i++) {
                let c = Util.searchTree(comments[i], action.voted);
                if(c !== null && c) {
                    // If the previous vote was 0, we just need to increase by the value (+1 or -1)
                    // If it wasn't 0, it means we need to increase by the value * 2 (+2 or -2) to compensate for the previous vote being revoked
                    c.totalVotes += action.prevUserVote !== 0 ? (action.value * 2) : action.value;
                    c.userVote = action.value;
                }
            }
            
            return { 
                ...state,
                sendingCommentVote: 0,
                comments: comments
            }
        }
        case COMMENT.VOTE_COMMENT_FAILURE: {
            return { 
                ...state,
                sendingCommentVote: 0
            }
        }
        
        case COMMENT.NEW_COMMENT_PENDING: {
            return {
                ...state,
                creatingNewComment: action.parent
            }
        }
        case COMMENT.NEW_COMMENT_SUCCESS: {
            // If this new comment has no parent then add it to the beginning of the stack
            if(action.payload.parentId === null || !action.payload.parentId) {
                return {
                    ...state,
                    comments: [
                        action.payload,
                        ...state.comments
                    ],
                    creatingNewComment: undefined
                }
            }
            // Else, this comment has a parent and we need to transverse the tree to look for the right leaf to place it
            else {
                // Hack: we deep-clone the comments instead of editing it directly because Redux performs shallow-checks on new props
                // Since the changes are deep within the tree, referential inequality isn't met and the component is re-rendered. According
                // https://redux.js.org/faq/react-redux#react-props-dispatch
                // http://arqex.com/wp-content/uploads/2015/02/trees.png
                let comments = JSON.parse(JSON.stringify(state.comments));
                for(var j = 0; j < state.comments.length; j++) {
                    // Use the util function to transverse this tree until we find a comment whose ID matches this parent
                    var k = Util.searchTree(comments[j], action.payload.parentId);
                    if(k !== null && k) {
                        // k must be the parent, so let's append this comment to its children at the beginning
                        k.children = [action.payload, ...k.children];
                    } 
                }
                // All done, now update the state
                return {
                    ...state,
                    comments: comments,
                    creatingNewComment: undefined,
                }
            }
        }
        case COMMENT.NEW_COMMENT_FAILURE: {
            return {
                ...state,
                creatingNewComment: undefined
            }
        }
        default: 
            return state;
    }
}

