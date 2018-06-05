import { SUBREDDIT } from './types';
import axios from 'axios';

export const fetchSubreddits = (page, search) => dispatch => {
    dispatch({ type: SUBREDDIT.FETCH_SUBREDDIT_LIST_PENDING });

    let url = search === undefined ? '/api/subreddits?p=' + page : '/api/subreddits/' + search + '?p=' + page;

    return axios.get(url).then(results => {
        dispatch({
            type: SUBREDDIT.FETCH_SUBREDDIT_LIST_SUCCESS,
            payload: results.data.subreddits,
            pagedata: results.data.pagedata
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
