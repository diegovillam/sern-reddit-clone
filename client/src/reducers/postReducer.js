import { POST } from '../actions/types';

const initialState = {
    posts: [], // For multiple post view
    post: {}, // For single post view
    loading: true,
    sendingPostVote: 0, // The post ID being voted)
    page: {
        hasNext: false,
        hasPrevious: false
    }
};

export default function(state = initialState, action) {
    switch(action.type) {
        case POST.RESET_POST: {
            return initialState;
        }
        
        case POST.FETCH_POST_LIST_PENDING: {
            return {
                ...state,
                loading: true
            }
        }
        case POST.FETCH_POST_LIST_SUCCESS: {
            return {
                ...state,
                posts: action.payload.posts,
                page: action.payload.pagedata,
                loading: false
            }
        }
        case POST.FETCH_POST_LIST_FAILURE: {
            return {
                ...state,
                loading: false
            }
        }
        case POST.FETCH_POST_SINGLE_PENDING: {
            return {
                ...state,
                loading: true
            }
        }
        case POST.FETCH_POST_SINGLE_SUCCESS: {
            return {
                ...state,
                post: action.payload,
                loading: false
            }
        }
        case POST.FETCH_POST_SINGLE_FAILURE: {
            return {
                ...state,
                loading: false
            }
        }
        case POST.VOTE_POST_PENDING: {
            return { 
                ...state,
                sendingPostVote: action.voted
            }
        }
        case POST.VOTE_POST_SUCCESS: {

            //console.log('Previous vote for thisinstance: ', action.prevUserVote);
            return { 
                ...state,
                sendingPostVote: 0,

                // Simply find the post ID that matches the one sent by the action and modify it
                // For all other unmatching posts, their state is the same. This is for the multiple-posts-view
                // i.e., the subreddit general view with a list of posts
                posts: state.posts.map((post, i) => post.id === action.voted ? {
                    ...post,
                    // If the previous vote was 0, we just need to increase by the value (+1 or -1)
                    // If it wasn't 0, it means we need to increase by the value * 2 (+2 or -2) to compensate for the previous vote being revoked
                    totalVotes: post.totalVotes + (action.prevUserVote !== 0 ? (action.value * 2) : action.value),
                    userVote: action.value
                } : post),

                // In case the vote was casted in a single-post-view, modify its single state. This is for the
                // single post views
                post: action.voted === state.post.id ? {
                    ...state.post,
                    totalVotes: state.post.totalVotes + (action.prevUserVote !== 0 ? (action.value * 2) : action.value),
                    userVote: action.value
                } : state.post
            }
        }
        case POST.VOTE_POST_FAILURE: {
            return { 
                ...state,
                sendingPostVote: 0
            }
        }
        default: 
            return state;
    }
}