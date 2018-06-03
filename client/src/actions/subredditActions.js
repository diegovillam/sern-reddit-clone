import { SUBREDDIT } from './types';
import axios from 'axios';

export const fetchSubreddits = () => dispatch => {
    dispatch({ type: SUBREDDIT.FETCH_SUBREDDIT_LIST_PENDING });
    return axios.get('/api/subreddits').then(subreddits => {
        dispatch({
            type: SUBREDDIT.FETCH_SUBREDDIT_LIST_SUCCESS,
            payload: subreddits
        });
    }).catch(error => {
        dispatch({
            type: SUBREDDIT.FETCH_SUBREDDIT_LIST_FAILURE
        });
    });
}

export const getSubreddit = (subreddit) => dispatch => {
    dispatch({ type: SUBREDDIT.FETCH_SUBREDDIT_SINGLE_PENDING });
    return axios.get('/api/subreddit/'+subreddit).then(subreddit => {
        dispatch({
            type: SUBREDDIT.FETCH_SUBREDDIT_SINGLE_SUCCESS,
            payload: subreddit
        });
    }).catch(error => {
        dispatch({
            type: SUBREDDIT.FETCH_SUBREDDIT_SINGLE_FAILURE
        });
    });
}
