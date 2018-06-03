import { combineReducers } from 'redux';
import postReducer from './postReducer';
import userReducer from './userReducer';
import subredditReducer from './subredditReducer';
import commentReducer from './commentReducer';
import moderatorReducer from './moderatorReducer';

export default combineReducers({
    posts: postReducer,
    users: userReducer,
    subreddits: subredditReducer,
    comments: commentReducer,
    moderator: moderatorReducer
});