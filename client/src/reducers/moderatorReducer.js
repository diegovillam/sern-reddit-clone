import { MODERATOR } from '../actions/types';

const initialState = {
    moderator: false,
    loading: false,
    status: undefined,
    errors: {}
};

export default function(state = initialState, action) {
    switch(action.type) {
        case MODERATOR.FETCH_MODERATOR_PENDING: {
            return {
                ...state,
                loading: true,
                moderator: false
            }
        }
        case MODERATOR.FETCH_MODERATOR_SUCCESS: {
            return {
                ...state,
                moderator: action.moderator,
                loading: false
            }
        }
        case MODERATOR.FETCH_MODERATOR_FAILURE: {
            return {
                ...state,
                loading: false,
                moderator: false
            }
        }
        case MODERATOR.SUSPEND_USER_PENDING: {
            return {
                ...state,
                status: undefined
            }
        }
        case MODERATOR.SUSPEND_USER_FAILURE: {
            return {
                ...state,
                status: undefined,
                errors: action.errors
            }
        }
        case MODERATOR.SUSPEND_USER_SUCCESS: {
            return {
                ...state,
                status: action.status,
                errors: {}
            }
        }
        case MODERATOR.ALTER_RULE_PENDING: {
            return {
                ...state,
                status: undefined
            }
        }
        case MODERATOR.ALTER_RULE_FAILURE: {
            return {
                ...state,
                status: undefined,
                errors: action.errors
            }
        }
        case MODERATOR.ALTER_RULE_SUCCESS: {
            return {
                ...state,
                status: action.status,
                errors: {}
            }
        }
        case MODERATOR.UNSUSPEND_USER_PENDING: {
            return {
                ...state,
                status: undefined
            }
        }
        case MODERATOR.UNSUSPEND_USER_FAILURE: {
            return {
                ...state,
                status: undefined,
                errors: action.errors
            }
        }
        case MODERATOR.UNSUSPEND_USER_SUCCESS: {
            return {
                ...state,
                status: action.status,
                errors: {}
            }
        }
        default: 
            return state;
    }
}

