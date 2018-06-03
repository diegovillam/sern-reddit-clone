/**
 * GET /auth/user -- Get the user data from the given JSON web token
 * POST /auth/login -- Login an user and return a JSON web token for the session
 * POST /auth/register -- Create a new user
 */
var express = require('express');
var router = express.Router();
var models = require('../models');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('./../config/jsonwebtoken');
var sequelize = require('sequelize');

// GET get user
router.get('/user', (req, res, next) => {

    if(!req.headers.authorization) {
        return res.status(401).end();
    }

    // get the last part of this authorization header string such as "bearer token-value"
    const token = req.headers.authorization.split(' ')[1];
    // now check the JWT
    return jwt.verify(token, config.jwtSecret, (err, decoded) => {
        // 401 for unauthorized use
        if(err) {
            return res.status(401).end();
        }
        const userId = decoded.sub;
        // the sub is the reserved space for the unique "bearer" (user id)
        // now use this ID to match it in database
        return models.user.findOne({
            where: {id: userId},
            attributes: {exclude: ['password']},
        }).then(async user => {
            user = user.toJSON();
            // Now we will get count of unread messages for this user and then pass it on
            var messages = await models.message.count({ where: {receiverId: user.id, [sequelize.Op.or]: [{status: null}, {status: 0}]}});
            user.messages = messages;

            res.status(200).json({
                success: true,
                user: user
            }).end();
        }).catch(error => {
            console.log(error);
            res.status(400).json(error);
        });
    });
    return res.status(200).json(req.headers);
});

// POST register user
router.post('/signup', (req, res, next) => {
    const validationResult = validateSignupForm(req.body);
    // Check for errors in the result
    if(!validationResult.success) { 
        return res.status(400).json({
            success: false,
            message: validationResult.message,
            errors: validationResult.errors
        });
    }
    // Send success message
    return passport.authenticate('local-signup', (err) => {
        // any error from this point would be an unique key constraint from the schema
        // other possible errors aren't accounted but there shouldn't be any errors anyway
        if(err) {
            return res.status(400).json({
                success: false,
                errors: {
                    username: 'This username is already taken by somebody else.'
                }
            });
        }

        // sign up succesfully
        return res.status(200).json({
            success: true,
            message: "You have signed up. You should be able to login now."
        });
    }) (req, res, next); // remember to move the request
});

// POST log in user
router.post('/login', (req, res, next) => {
    const validationResult = validateLoginForm(req.body);
    // Check for errors in the result
    if(!validationResult.success) {
        return res.status(400).json({
            success: false,
            errors: {
                ...validationResult.errors,
                message: validationResult.message
            }
        });
    }
    // Send success message
    return passport.authenticate('local-login', (err, token, userData) => {
        if(err) {
            // any errors here are thrown from the passport function for not finding 
            // username and password combinations
            if(err.name === 'IncorrectCredentialsError') {
                return res.status(401).json({
                    success: false,
                    errors: {
                        message: 'Incorrect username and password combination.'
                    }
                });
            }
            // but just in case, check for other errors
            return res.status(400).json({
                success: false,
                errors: {
                    message: 'There was an error with your request.',
                    username: 'Error in request'
                }
            });
        }

        // successful log in
        return res.status(200).json({
            success: true,
            message: "You have successfully logged in",
            token,
            user: userData
        });
    }) (req, res, next); // remember to move the request
});


/**
 * Validate the sign up form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignupForm(payload) {
    
    const errors = {};
    let isFormValid = true;
    let message = '';

    if (!payload || typeof payload.username !== 'string' || payload.username.trim().length === 0) {
        isFormValid = false;
        errors.username = 'Please provide a correct username.';
    }

    if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 6) {
        isFormValid = false;
        errors.password = 'The password must be at least six characters long.';
    }

    return {
        success: isFormValid,
        errors
    };
}

/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateLoginForm(payload) {
    
    const errors = {};
    let isFormValid = true;
    let message = '';

    if (!payload || typeof payload.username !== 'string' || payload.password.trim().length === 0) {
        isFormValid = false;
        errors.username = 'Please provide your username.';
    }

    if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
        isFormValid = false;
        errors.password = 'Please provide your password.';
    }

    return {
        success: isFormValid,
        errors
    };
}

module.exports = router;
  
