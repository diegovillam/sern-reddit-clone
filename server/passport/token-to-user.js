var models = require('./../models');
var jwt = require('jsonwebtoken');
var config = require('./../config/jsonwebtoken');

module.exports.x = 5;

module.exports = function help() {
    console.log('help');
}

// Helper class
var user = function(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.jwtSecret, (err, decoded) => {
            if (err) {
                return undefined;
            }  
            const userId = decoded.sub;
            // the sub is the reserved space for the unique "bearer" (user id)
            // now use this ID to match it in database
            models.user.findById(userId, {attributtes: ['id', 'username']}).then(user => {
                if(!user || user === null || user === undefined)  {
                    return reject(new Error('No user found with that token.'));
                }
                resolve(user);
            }).catch(err => {
                reject(new Error('No user found with that token.')); // no user found
            });
        });
    });
}
module.exports = user;