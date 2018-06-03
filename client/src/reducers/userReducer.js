import { USER } from '../actions/types';

const initialState = {
    user: {}
};

export default function(state = initialState, action) {
    switch(action.type) {
        case USER.ADD_UNREAD_MESSAGE: {
            let user = state.user;
            user.messages += action.value;
            return {
                ...state,
                user: user
            }
        }
        case USER.USER_LOGIN: {
            return {
                ...state,
                user: action.payload
            }
        }
        case USER.USER_LOGOUT: {
            return {
                ...state,
                user: {}
            }
        }
        default: 
            return state;
    }
}