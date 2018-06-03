import { USER } from './types';
import Auth from 'modules/Auth';
import Sockets from 'modules/Sockets';

export const login = (user) => dispatch => {
    Sockets.connect(user.username);
    dispatch({ type: USER.USER_LOGIN, payload: user });
}

export const logout = () => dispatch => {
    dispatch({ type: USER.USER_LOGOUT });
}

export const checkCredentials = () => dispatch => {
    if(Auth.isUserAuthenticated()) {
        Auth.getUser().then(user => {
            Sockets.connect(user.username);
            dispatch({ type: USER.USER_LOGIN, payload: user });
        }).catch(error => {
            console.log(error);
        });
    }
}

export const addUnreadMessage = (value) => dispatch => {
    dispatch({ type: USER.ADD_UNREAD_MESSAGE, value: value });
}