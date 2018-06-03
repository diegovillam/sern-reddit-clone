var jwt = require('jsonwebtoken');
var models = require('./../models');
var PassportLocalStrategy = require('passport-local').Strategy;
var config = require('./../config/jsonwebtoken');
var bcrypt = require('bcrypt');

/**
 * Return the passport local strategy object
 */

module.exports = new PassportLocalStrategy((username, password, done) => {

    // Find an user by its username
    models.user.findOne({
        where: {
            username: username.trim()
        }
    }).then(user => {
        // Once we have the user, compare its password to the stored password
        bcrypt.compare(password, user.password).then(matches => {
            // matches = true when the login is valid, false if else, then throw an error
            if(!matches) {
                const error = new Error('Invalid username and password combination.');
                error.name = 'IncorrectCredentialsError';
                return done(error);
            }

            // sub is a reserved keyword for the payload object which holds a "bearer"
            // in this case the user's ID
            const payload = {
                sub: user.id
            };

            // Create a token string
            const token = jwt.sign(payload, config.jwtSecret);
            return done(null, token, user);
        });
    }).catch(err => {
        //console.log("I didn't find any user " + username + " with the password " + password);
        const error = new Error('No account has been found with that specified username.');
        error.name = 'IncorrectCredentialsError';
        return done(error);
    });
});