var jwt = require('jsonwebtoken');
var models = require('./../models');
var config = require('./../config/jsonwebtoken');

/**
 * The auth checker middleware function
 */

module.exports = (req, res, next) => {

    if(!req.headers.authorization) {
        return res.status(401).end();
    }

    // get the last part from an authorization header string, this is the bearer token
    const token = req.headers.authorization.split(' ')[1];

    // decode the token with our key
    return jwt.verify(token, config.jwtSecret, (err, decoded) => {
        // the 401 code is for unauthori
        if(err) {
            console.log('Error: ');
            console.log(err);
            return res.status(401).end();
        }

        const userId = decoded.sub;
        // check if this user exists (gotten from the decoded token's sub)
        return models.user.findById(userId).then(user => {
            return next();
        }).catch(err => {
            return res.status(401).end();
        });
    })
}