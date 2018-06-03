import { MODERATOR } from './types';
import { SUBREDDIT } from './types';

import Auth from 'modules/Auth';
import axios from 'axios';

// Unused
export const getModerator = (subredditId) => dispatch => {
    dispatch({ type: MODERATOR.FETCH_MODERATOR_PENDING });
    if(Auth.isUserAuthenticated()) {
        axios.get('/api/moderator/'+subredditId+'/'+Auth.getToken()).then(mod => {
            if(mod !== null) {
                dispatch({ type: MODERATOR.FETCH_MODERATOR_SUCCESS, moderator: mod.data });
            } else {
                dispatch({ type: MODERATOR.FETCH_MODERATOR_SUCCESS, moderator: false });
            }
        }).catch(() => { dispatch({ type: MODERATOR.FETCH_MODERATOR_FAILURE }); });
    } else { dispatch({ type: MODERATOR.FETCH_MODERATOR_FAILURE }); }
}

export const suspendUser = (username, duration, reason, rule, subreddit) => dispatch => {
    dispatch({ type: MODERATOR.SUSPEND_USER_PENDING });

    axios.post('/api/moderator/suspend', {
        token: Auth.getToken(),
        username: username,
        duration: duration,
        reason: reason,
        rule: rule,
        subreddit: subreddit
    }, { headers: Auth.getApiAuthHeader() }).then(result => {
         // From the new suspnsion object we can generate a new individual suspension to be appended to the current
         // subreddit suspensions list. The result isn't in the same format as the other suspensions, so let's build it.
        let suspension = {
            userId: result.data.userId,
            user: {
                id: result.data.userId,
                username: username
            }
        }
        
        dispatch({
            type: SUBREDDIT.ALTER_SUSPENSION,
            add: true,
            suspension: suspension
        });
        dispatch({ 
            type: MODERATOR.SUSPEND_USER_SUCCESS, 
            status: {
                type: 'SuspendUser',
                header: 'User suspension',
                text: 'The user '+username+' was suspended successfully.'
            }
        });
    }).catch(errors =>{
        dispatch({ 
            type: MODERATOR.SUSPEND_USER_FAILURE,
            errors: errors.response.data.errors
        });
    });
}

export const createRule = (title, description, type, subreddit) => dispatch => {
    dispatch({ type: MODERATOR.ALTER_RULE_PENDING });

    axios.post('/api/moderator/rule', {
        token: Auth.getToken(),
        title: title,
        description: description,
        type: type,
        subreddit: subreddit
    }, { headers: Auth.getApiAuthHeader() }).then(rule => {
        dispatch({
            type: SUBREDDIT.ALTER_RULE,
            add: true,
            rule: rule.data
        });
        dispatch({
            type: MODERATOR.ALTER_RULE_SUCCESS,
            status: {
                type: 'CreateRule',
                header: 'Created new rule',
                text: 'The rule "' + title + '" has been created successfully.'
            }
        });
    }).catch(error => {
        dispatch({ type: MODERATOR.ALTER_RULE_FAILURE });
    });
}

export const deleteRule = (id, subreddit) => (dispatch, getState) => {
    dispatch({ type: MODERATOR.ALTER_RULE_PENDING });

    axios.delete(('/api/moderator/rule/'+id), {}, { headers: Auth.getApiAuthHeader() }).then(() => {
        // We have to remove the rule that was removed from the active subreddits' rules list
        // This is stored in the app's state store, so let's use an action that will modify this rule
        dispatch({
            type: SUBREDDIT.ALTER_RULE,
            add: false,
            rule: id
        });
        // Dispatch the success
        dispatch({
            type: MODERATOR.ALTER_RULE_SUCCESS,
            status: {
                type: 'DeleteRule',
                header: 'Deleted rule',
                text: 'The rule has been deleted successfully.'
            }
        });
    }).catch(error => {
        dispatch({ type: MODERATOR.ALTER_RULE_FAILURE });
    });
}

export const revokeSuspension = (id) => dispatch => { 
    dispatch({ type: MODERATOR.UNSUSPEND_USER_PENDING });
    
    axios.delete(('/api/moderator/suspension/'+id), {}, {headers: Auth.getApiAuthHeader()}).then(() => {
        // We have to remove the suspension that was removed from active subreddits' suspension list
        // This is stored in the app's state store so let's use an action that will modify this suspension
        dispatch({
            type: SUBREDDIT.ALTER_SUSPENSION,
            add: false,
            id: id
        });
        dispatch({
            type: MODERATOR.UNSUSPEND_USER_SUCCESS,
            status: {
                type: 'RevokeSuspension',
                header: 'Revoked suspnsion',
                text: 'The user\'s suspension has been removed successfully.'
            }
        });
    }).catch(error => {
        dispatch({ type: MODERATOR.UNSUSPEND_USER_FAILURE });
    })
 }