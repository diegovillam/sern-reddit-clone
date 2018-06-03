import { 
    SUBREDDIT
} from '../actions/types';

const initialState = {
    active: {}, // Get the viewing subreddit
    subreddits: [],
    loading: false
};

export default function(state = initialState, action) {
    switch(action.type) {
        case SUBREDDIT.FETCH_SUBREDDIT_LIST_PENDING: {
            return {
                ...state,
                loading: true
            }
        }
        case SUBREDDIT.FETCH_SUBREDDIT_LIST_SUCCESS: {
            return {
                ...state,
                subreddits: action.payload.data,
                loading: false
            }
        }
        case SUBREDDIT.FETCH_SUBREDDIT_LIST_FAILURE: {
            return {
                ...state,
                loading: false
            }
        }

        case SUBREDDIT.FETCH_SUBREDDIT_SINGLE_PENDING: {
            return {
                ...state,
                loading: true
            }
        }
        case SUBREDDIT.FETCH_SUBREDDIT_SINGLE_SUCCESS: {
            return {
                ...state,
                active: action.payload.data,
                loading: false
            }
        }
        case SUBREDDIT.FETCH_SUBREDDIT_SINGLE_FAILURE: {
            return {
                ...state,
                loading: false
            }
        }
        case SUBREDDIT.ALTER_SUSPENSION: {
            let active = state.active;
            // Removing a suspension
            if(action.add === false) {
                let idx = -1;
                for(var i = 0; i < active.suspensions.length; i++) {
                    if(active.suspensions[i].userId === action.id) {
                        idx = i;
                        break;
                    }
                }
                active.suspensions.splice(idx, 1);
            } else {
                // Adding a new suspension. The suspension is generated from the action creator based on back end response
                active.suspensions.push(action.suspension);
            }

            return {
                ...state,
                active: active
            }
            
        }
        case SUBREDDIT.ALTER_RULE: {
            // This case is called mostly when the moderator deletes a rule, so the rules listing will be updated
            // Without having to refetch the new rules set from the API
            let active = state.active;
            // Removing a rule
            if(action.add === false) {
                let idx = -1;
                for(var j = 0; j < active.rules.length; j++) {
                    if(active.rules[j].id === action.id) {
                        idx = j;
                        break;
                    }
                }
                active.rules.splice(idx, 1);
            } else {
                // Adding a new rule. The rule is passed by the action creator
                active.rules.push(action.rule);
            }
            
            return {
                ...state,
                active: active
            }
        }
        default: 
            return state;
    }
}