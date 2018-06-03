import axios from 'axios';

class Auth {
    // Authenticate an user with a token to be saved locally
    static authenticateUser(token) {
        localStorage.setItem('token', token);
    }
    // Is authenticated, check if token is saved locally
    static isUserAuthenticated() {
        return localStorage.getItem('token') !== null;
    }
    // Deauthenticate an user. Remove their token from storage
    static deauthenticateUser() {
        localStorage.removeItem('token');
    }
    // Get token value
    static getToken() {
        return localStorage.getItem('token');
    }

    // Get authorization header for API request
    static getApiAuthHeader() {
        return {'authorization': `bearer ${Auth.getToken()}`};
    }

    // Get user oject from API using token
    static async getUser() {
        return new Promise((resolve, reject) => {
            axios.get('/auth/user', {
                headers: {'Authorization': `bearer ${Auth.getToken()}`}
            }).then(res => {
                //return res.data.user;
                resolve(res.data.user);
            }).catch(err => {
                //return err.response;
                reject(err);
            });
        });
    }

    // Get user admin rank
    static async getAdmin() {
        return new Promise((resolve, reject) => {
            Auth.getUser().then(user => {
                resolve(user !== undefined ? user.admin : 0);
            }).catch(() => {
                resolve(0);
            });
        });
    }
}

export default Auth;