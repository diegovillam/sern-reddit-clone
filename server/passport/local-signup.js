var models = require('./../models');
const PassportLocalStrategy = require('passport-local').Strategy;

/**
 * Return the passport local strategy object
 */

module.exports = new PassportLocalStrategy((username, password, done) => {
    const newUser = models.user.build({
        username: username.trim(),
        password: password.trim()
    });

    newUser.save().then(res => {
        return done(null);
    }).catch(err => {
        return done(err);
    });
});