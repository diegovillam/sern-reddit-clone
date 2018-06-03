/**
 * GET /comments/:post -- Get comments for a post ID [includes user for each comment] (Uses recursion to get subchildren of comments)
 * GET /comment/:id/votes -- Get upvotes, downvotes, and difference for the comment ID
 * POST /comment -- Create a new comment
 * GET /subreddits/name? -- Get a list of subreddits, optionally filtered by name .
 * GET /subreddit/:subreddit -- Get details for a specific subreddit handle [includes user and moderators].
 * POST /subreddit -- Submit new subreddit with the specified name and description in the body
 * GET /posts/:subreddit -- Get a list of posts in a subreddit name [includes user for each]
 * GET /posts/home -- Get a list of posts for the home page
 * GET /post/search/:subreddit/:query -- Get posts matching the searched query in the subreddit id [includes user]
 * GET /post/:id -- Get post details for the specified ID, including its user and subreddit [includes user and subreddit].
 * GET /post/:id/votes -- Get upvotes, downvotes, and difference for the post ID
 * POST /post/create -- Send a new post
 * GET /votes/post/:post:/:userId -- Get votes for the post ID and user ID
 * GET /votes/comment/:post:/:token -- Get votes for the comment ID and user-token ID
 * POST /votes/post -- Create a new vote for the post ID from the user-token ID
 * POST /votes/comment -- Create a new vote for the comment ID from the user-token ID
 * GET /moderator/:subreddit/:user -- Get the moderator matching the subreddit ID and the user
 * POST /moderator/suspend -- Suspend an user
 * POST /message -- Send new private message
 * GET /messages/in/:token -- Get INCOMING messages data for the user with the given token
 * GET /messages/out/:token -- Get OUTGOING messages data for the user with the given token
 * PUT /message -- Edit a message (i.e. change its status)
 * DELETE /moderator/rule/:id/ -- Delete the specified rule ID
 * POST /moderator/rule -- Create a new rule for a subreddit
 * GET /user/:id -- Get user details
 * 
 * PRIVATE API ROUTES
 * POST /votes/post
 * POST /votes/comment
 * POST /subreddit
 * POST /post/create
 * POST /comment
 * POST /moderator/suspend
 * GET /messages/in/:token
 * GET /messages/in/:token
 * PUT /message
 */
var express = require('express');
var router = express.Router();
var models = require('./../models');
var async = require('async');
var sequelize = require('sequelize');
var session_check = require('./../middleware/session-check');
var tokenToUser = require('./../passport/token-to-user');
var moment = require('moment');
var slug = require('slug');

const Op = sequelize.Op;

router.get('/comment/:id/votes', (req, res) => {
    models.comment.findOne({ where: { id: req.params.id } }).then(results => {
        results.getVoteCounts().then(votes => {
            res.status(200).json(votes);
        }).catch(error => {
            res.status(400).json(error); // Error in fetching votes
        });
    }).catch(error => {
        res.status(400).json(error); // Error in fetching post
    });
});

router.get('/test', (req,res) => {
    models.comment.getComments(3).then(p => res.status(200).json(p));
});

router.get('/comments/:post', (req, res) => {
    
    var parent = req.query.p ? req.query.p : undefined;
    var noLimit = parent > 0 ? true : false;
    var user = req.query.u ? req.query.u : undefined;
    var offset = req.query.o ? req.query.o : 0;
    var post = req.params.post;

    // Get comments where parent is undefined, unlimited limit, undefined user
    models.comment.getComments(post, parent, noLimit, user, Number(offset)).then(roots => {
        // Roots is the leaves, parent-less comments
        var comments = [];
        // Iterate thru each root asynchronously and get its children
        async.each(roots, (root, callback) => {
            // expandChildren() will use recursion!
            root.expandChildren(user).then(expandedRoot => {
                comments.unshift(expandedRoot); // unshift instead of push because we want to preserve the order (first in, first out)
                callback();
            });
        }, async (error) => {
            if(error) {
                return res.status(400).json(error);
            }
            // We get the total count of ROOT comments for this post
            var count = await models.comment.count({ where: {parentId: null, postId: post }});

            // There are available pages if this count is lower than the current page * the max amount per page
            var pagedata = {
                hasNext: count >= ((Number(offset) + 1) * models.comment.settings.maxPerPage),
                page: Number(offset),
                data: {count:count, offset:Number(offset), mpp: models.comment.settings.maxPerPage}
            }
            res.status(200).json({ comments: comments, pagedata: pagedata });
        });
    }).catch(error => {
        return res.status(400).json(error);
    });
});

router.get('/subreddits/:name?', (req, res) => {
    if(req.params.name === undefined) {
        models.subreddit.findAll().then(results => {
            res.status(200).json(results);
        }).catch(error => {
            res.status(400).json(error);
        });
    } else {
        models.subreddit.findAll({ where: { name: { [Op.like]: '%'+req.params.name+'%' }}}).then(results => {
            res.status(200).json(results);
        }).catch(error => {
            res.status(400).json(error);
        });
    }
});

router.get('/posts/home', (req, res) => {
    var page = req.query.p ? (typeof req.query.p === 'number' ? req.query.p : 0) : 0;
    var userId =  req.query.u ? req.query.u : undefined;
    var maxPerPage = models.post.settings.maxPerPage;

    models.post.getPosts(maxPerPage, page, userId).then(results => {
        // Those don't contain slugs because are acquired from raw SQL queries, and as such
        // the Sequelize getter methods aren't performed. We will add the slug to each row manually
        async.each(results.posts, (post, callback) => {
            post.slug = slug(post.title).toLowerCase();
            callback();
        }, () => {
            // All slugs sent, go
            res.status(200).json(results);
        });
    }).catch(error => {
        console.log(error);
        res.status(400).json(error);
    });
});

router.get('/posts/:subreddit', (req, res) => {
    models.subreddit.findOne({
        where: {
            name: req.params.subreddit
        },
    }).then(subreddit => {
        if(subreddit === null || subreddit === null) {
            throw new Error('Subreddit not found.');
        }
        var page = req.query.p ? (typeof req.query.p === 'number' ? req.query.p : 0) : 0;
        var user =  req.query.u ? req.query.u : undefined;
        var pageMax = models.post.settings.maxPerPage;
        
        models.post.getPosts(pageMax, page, user, subreddit.name).then(rows => {
            // We got the rows but they are lacking the virtual values, let's compute them manually for each row
            var posts = rows.posts;
            async.each(posts, (post, callback) => {
                post.createdAtFormatted = moment(this.createdAt, 'YYYY-MM-DDTHH:mm', false).format('MMMM Do, YYYY hh:mma');
                post.slug = slug(post.title).toLowerCase();

                // Also, let's create an user subitem
                post.user = {};
                post.user.id = post.userId;
                post.user.username = post.username;
                // All done
                callback();
            }, () => {
                // All rows are processed
                res.status(200).json(rows);
            });
        }).catch(error => {
            console.log(error);
        })
    }).catch(error => {
        console.log('Error getting handle: ', error);
        res.status(400).json(error); // Error getting subreddit handle
    });
});

router.get('/subreddit/:name', (req, res) => {
    models.subreddit.findOne({ where: { name: req.params.name },
        include: [
            {
                // Get the moderators for this sub with their user instances
                model: models.moderator, 
                required: false,
                include: [{ // Also get the user object for this moderator
                    model: models.user,
                    attributes: ['id', 'username'],
                    required: true
                }]
            },
            {
                // Get the user that created this sub
                model: models.user,
                required: false
            },
            {
                // Get the rules for this sub
                model: models.rule,
                required: false,
            },
            {
                model: models.suspension,
                attributes: ['userId'],
                include: [{
                    model: models.user,
                    attributes: ['id', 'username']
                }]
            }
        ]
    }).then(results => {
        // We have the subreddit now but we also want to get some rules
        res.status(200).json(results);
    }).catch(error => {
        res.status(400).json(error);
    });
});

router.post('/subreddit', session_check, (req, res, next) => {
    const requiredKeys = ['name', 'description', 'userId'];
    var errors = {};
    requiredKeys.forEach(key => {
        if(req.body[key] === undefined || !req.body[key]) {
            errors[key] = "The " + key + " is required";
        } else if(key === 'name') {
            if(req.body[key] === 'home') {
                errors[key] = "This subreddit name is reserved.";
            }
        }
    });
    if(Object.keys(errors).length > 0) {
        res.status(400).json(errors);
    } else {
        var subreddit = models.subreddit.build({
            name: req.body.name,
            description: req.body.description,
            userId: req.body.userId
        });
        subreddit.save().then(r => {
            // The sub is created but we also need a new moderator
            var moderator = models.moderator.build({
                level: 2,
                userId: req.body.userId,
                subredditId: r.id
            });
            moderator.save().then(() => {
                res.status(200).json(r);
            });
        }).catch(error => {
            if(error.name === 'SequelizeUniqueConstraintError') {
                res.status(400).json({ name: "The community " + req.body.name + "already exists." });
            } else {
                res.status(400).json(error);
            }
        });
    }
});

router.post('/post/create', session_check, (req, res, next) => {
    const requiredKeys = ['subreddit', 'title'];
    var errors = {};
    requiredKeys.forEach(key => {
        if(req.body[key] === undefined || !req.body[key]) {
            errors[key] = "The " + key + " is required";
        }
    })
    if(Object.keys(errors).length > 0) {
        res.status(400).json(errors);
    } else {
        // Get the subreddit and the user in parallel requests
        async.parallel({
            subreddit: function(callback) {
                models.subreddit.findOne({
                    where: {
                        name: req.body.subreddit
                    }, attributes: ['id', 'name']
                }).then(subreddit => {
                    callback(null, subreddit);
                }).catch(error => {
                    callback(error, null);
                });
            },
            user: function(callback) {
                tokenToUser(req.body.token).then(user => {
                    callback(null, user);
                }).catch(error => {
                    callback(error, null);
                });
            }
        }, function(error, results) { // Once we got the user and the subreddit, we can now build the post
            if(error) {
                return res.status(400).json(error);
            }
            // The specified subreddit wasn't found
            if(results.subreddit === undefined || !results.subreddit) {
                return res.status(400).json({ subreddit: 'This subreddit doesn\'t exist.' });
            }
            // It was found, now check for suspensions
            models.suspension.findOne({
                where: {
                    subredditId: results.subreddit.id,
                    userId: results.user.id,
                    expires: {[Op.gt]: 0}
                },
                include: [
                    {
                        model: models.moderator,
                        include: [
                            {
                                model: models.user,
                                attributes: ['username']
                            }                                
                        ]
                    },
                    {
                        model: models.subreddit,
                        attributes: ['name']
                    }
                ]
            }).then(suspension => {
                if(suspension !== null) {
                    return res.status(401).json({ subreddit: suspension.reason });
                }
                var post = models.post.build({
                    title: req.body.title,
                    text: req.body.text,
                    link: req.body.link || null,
                    subredditId: results.subreddit.id,
                    userId: results.user.id
                });
                post.save().then(() => {
                    res.status(200).json(post);
                }).catch(error => {
                    console.log(error); // Error saving post
                    res.status(400).json(error);
                }) 
            }).catch(error => {
                console.log(error); //Error fetching suspension
                res.status(400).json(error);
            });
        });
    }
});
router.get('/post/:id', (req, res) => {
    models.post.findOne({
        where: {
            id: req.params.id
        },
        include: [
            {
                model: models.user,
                required: true
            },
            {
                model: models.subreddit,
                required: true,
                include: [{
                    model: models.suspension,
                    attributes: ['userId']
                }]
            }
        ]
    }).then(results => {
        res.status(200).json(results);
    }).catch(error => {
        res.status(400).json(error);
    });
});

router.post('/votes/comment', session_check, (req, res, next) => {
    // Get the JWT and convert it into an user
    tokenToUser(req.body.token).then(user => {
        models.comment.findOne({
            where: {
                id: req.body.commentId
            }
        }).then(comment => {
            // Update existing vote, or create a new one
            models.commentvote.findOne({
                where: {
                    commentId: comment.id,
                    userId: user.id
                }
            }).then(existing => {
                if(existing.value !== req.body.value) {
                    existing.update({
                        value: req.body.value
                    }).then(() => {
                        res.status(200).end(); // Complete vote update
                    });
                } else {
                    res.status(304).end(); // Nothing to change
                }
            }).catch(() => { // No vote exists, create a new one
                var commentvote = models.commentvote.build({
                    commentId: comment.id,
                    userId: user.id,
                    value: req.body.value
                });
                commentvote.save().then(() => {
                    res.status(200).end();
                }).catch(error => {
                    res.status(400).json(error); // Error saving
                });
            })
        }).catch(error => {
            res.status(400).json(error); // Post not found
        })
    }).catch(error => {
        res.status(400).json(error); // Error authenticating user
    });
});

router.post('/votes/post', session_check, (req, res, next) => {
    // Get the JWT and convert it into an user
    tokenToUser(req.body.token).then(user => {
        if(user === undefined || user === null) {
            return res.status(400).json({ error: 'Invalid user token '});
        }
        // We will find the post that is being voted and also inclued its user (so we can modify their karma)
        models.post.findOne({ where: { id: req.body.postId }, include: [{model: models.user, attributes: ['id', 'karma']}]}).then(post => {
            // Find the postvote belonging to this post. It might not exist (be null)
            models.postvote.findOne({
                where: {
                    postId: post.id,
                    userId: user.id
                }
            }).then(existing => {
                // If the values are different is if the vote is changed
                if(existing.value !== req.body.value) {
                    // Update the vote and the karma
                    existing.update({ value: req.body.value }).then(() => {
                        return post.user.update({ karma: (post.user.karma + req.body.value )});
                    }).then(() => {
                        res.status(200).end(); // Complete vote update
                    });
                } else {
                    res.status(304).end(); // Nothing to change
                }
            }).catch(() => { // No vote exists, create a new one
                var postvote = models.postvote.build({
                    postId: post.id,
                    userId: user.id,
                    value: req.body.value
                });
                postvote.save().then(async () => {
                    // After the new vote is saved, update the karma too
                    await post.user.update({ karma: (post.user.karma + req.body.value )});
                    // OK
                    res.status(201).end();
                }).catch(error => {
                    res.status(400).json(error); // Error saving
                });
            })
        }).catch(error => {
            res.status(400).json(error); // Post not found
        })
    }).catch(error => {
        res.status(400).json(error); // Error fetching user from token
    });
});


router.get('/votes/post/:id/:userId', (req, res, next) => {
    // Get the post vote for this post and this user
    models.postvote.findOne({
        where: {
            postId: req.params.id,
            userId: req.params.userId
        },
        include: [{
            model: models.post,
            include: [{
                model: models.subreddit,
                include: [{
                    model: models.suspension
                }],
                attributes: ['id']
            }],
            attributes: ['id', 'title']
        }]
        
    }).then(postvote => {
        res.status(200).json(postvote);
    }).catch(error => {
        
        console.log('ERROR', error);
        res.status(200).json(error);
        //res.status(400).json(error); // Error fetching post votes
    });
});

router.get('/votes/comment/:id/:token', session_check, (req, res, next) => {
    // Get the JWT and convert it into an user
    tokenToUser(req.params.token).then(user => {
        if(user === undefined || user === null) {
            return res.status(400).json({ error: 'Invalid user token '});
        }
        models.commentvote.findOne({
            where: {
                commentId: req.params.id,
                userId: user.id
            }
        }).then(commentvote => {
            res.status(200).json(commentvote !== null ? commentvote : 0);
        }).catch(error => {
            res.status(400).json(error); // Error fetching comment votes
        });
    }).catch(error => {
        res.status(400).json(error); // Error fetching user from token
    });
});

router.get('/post/:id/votes', (req, res) => {
    models.post.findOne({
        where: {
            id: req.params.id
        }
    }).then(result => {
        result.getVoteCounts().then(votes => {
            res.status(200).json(votes);
        }).catch(error => {
            res.status(400).json(error); // Error in fetching votes
        });
    }).catch(error => {
        res.status(400).json(error); // Error in fetching post
    });
});

router.get('/comment/:id/votes', (req, res) => {
    models.comment.findOne({
        where: {
            id: req.params.id
        }
    }).then(result => {
        result.getVoteCounts().then(votes => {
            res.status(200).json(votes);
        }).catch(error => {
            res.status(400).json(error); // Error in fetching votes
        });
    }).catch(error => {
        res.status(400).json(error); // Error in fetching comment
    });
});

router.post('/comment', session_check, (req, res, next) => {
    tokenToUser(req.body.token).then(user => {
        const requiredKeys = ['text', 'post', 'parent'];
        var errors = {};
        requiredKeys.forEach(key => {
            if(req.body[key] === undefined || req.body[key] === null) {
                errors[key] = "The " + key + " is required";
            }
        })
        if(Object.keys(errors).length > 0) {
            res.status(400).json(errors); // Error for incomplete form
        } else {
            var comment = models.comment.build({
                parentId: req.body.parent !== 0 ? req.body.parent : null,
                userId: user.id,
                postId: req.body.post,
                text: req.body.text
            });
            comment.save().then(created => {
                // Re-fetch the object so it includes dependencies like the user again
                models.comment.findById(created.id, {
                    include: [{
                        model: models.user,
                        attributes: ['id', 'username'],
                        // only bring comments that have an user...
                        required: true
                    }]
                }).then(result => {
                    res.status(200).json(result);
                }).catch(error => {
                    res.status(400).json(error); // Error re-fetching comment
                });
            }).catch(error => {
                res.status(400).json(error); // Error saving new comment
            });
        }
    }).catch(error => {
        res.status(400).json(error); // Error fetching user from token
    });
    
});

router.get('/post/search/:subreddit/:query', (req, res) => {
    models.post.findAll({
        where: {
            subredditId: req.params.subreddit,
            text: {
                [Op.like]: '%'+req.params.query+'%'
            }
        }
    }).then(results => {
        res.status(200).json(results);
    }).catch(error => {
        res.status(400).json(error);
    });
});

router.get('/test/:user', (req, res) => {
    models.user.findOne({where:{username:req.params.user}}).then(u=>{
        res.status(200).json({
            ['User ' + req.params.user]: u
        });
    }).catch(e=>{
        res.status(200).json({
            ['Exception for user ' + req.params.user]: e
        });
    })
})

router.put('/message', session_check, (req, res, next) => {
    models.message.findOne({where: {id: req.body.message}}).then(message => {
        return message.update({ status: req.body.status });
    }).then(() => {
        res.status(200).end();
    }).catch(error => {
        console.log('Error in PUT /message: ', error);
        res.status(400).json(error);
    });
});

router.get('/messages/in/:token', session_check, async (req, res, next) => {
    let token = req.params.token;
    if(!token || token === undefined) {
        return res.status(400).json({token: 'Invalid token provided'});
    }

    var user = await tokenToUser(token);
    if(user === null || !user) {
        return res.status(400).json({token: 'Invalid user from token'});
    }

    // Determines whether we get only 1 message or all of them
    var limit = req.query.limit ? 1: 1000;

    models.message.findAll({
        where: {
            receiverId: user.id,
        },
        include: [{
            model: models.user,
            as: 'sender',
            attributes: { exclude: ['password'] }
        }],
        order: [['createdAt', 'DESC']],
        limit: limit
    }).then(messages => {
        res.status(200).json(messages);
    }).catch(error => {
        res.status(400).json(error);
    });
});

router.get('/messages/out/:token', session_check, async (req, res, next) => {
    let token = req.params.token;
    if(!token || token === undefined) {
        return res.status(400).json({token: 'Invalid token provided'});
    }

    var user = await tokenToUser(token);
    if(user === null || !user) {
        return res.status(400).json({token: 'Invalid user from token'});
    }

    models.message.findAll({
        where: {
            senderId: user.id,
        },
        include: [{
            model: models.user,
            as: 'receiver',
            attributes: { exclude: ['password'] }
        }],
        order: [['createdAt', 'DESC']]
    }).then(messages => {
        res.status(200).json(messages);
    }).catch(error => {
        res.status(400).json(error);
    });
});

router.post('/message', session_check, async (req, res, next) => {
    const requiredKeys = ['username', 'token', 'subject', 'message'];
    var errors = {};
    requiredKeys.forEach(key => {
        if(req.body[key] === undefined || !req.body[key]) {
            errors[key] = "The " + key + " is required";
        } else if(key === 'name') {
            if(req.body[key] === 'home') {
                errors[key] = "This subreddit name is reserved.";
            }
        }
    });
    if(Object.keys(errors).length > 0) {
        res.status(400).json(errors);
    } else {
        var target = await models.user.findOne({where: {username: req.body.username}});
        if(target === null) {
            return res.status(400).json({username: 'That username doen\'t exist. Please verify the username and check for errors.'});
        }
        var user = await tokenToUser(req.body.token);
        if(user === null) {
            return res.status(400).json({username: 'Error validating user'});
        }

        var message = models.message.build({
            senderId: user.id,
            receiverId: target.id,
            subject: req.body.subject,
            message: req.body.message,
            status: 0
        });
        message.save().then(() => {
            res.status(200).end();
        }).catch(error => {
            res.status(400).json(error);
        });
    }
});

router.post('/moderator/suspend', session_check, (req, res, next) => {
    // Check for missing req body params
    const requiredKeys = ['token', 'username', 'duration', 'reason', 'rule', 'subreddit'];
    var errors = {};
    requiredKeys.forEach(key => {
        if(req.body[key] === undefined || !req.body[key] || req.body[key] === 0) {
            errors[key] = "The " + key + " is required";
        }
    })
    if(Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    // Check that the specified user exists
    models.user.findOne({
        where: {username: req.body.username},
        attributes: ['id']
    }).then(target => {
        if(target === null) {
            let error = {username: 'The username '+req.body.username+' does not exist.'};
            return res.status(400).json({errors: error});
        }
        // User exists
        // Moderator's token is passed in the req body, get the instance user+
        // Here we aren't revalidating because the middleware checks the session -- we simply need to transform the token to an user we can use
        tokenToUser(req.body.token).then(user => {
            models.moderator.findOne({
                where: {
                    subredditId: req.body.subreddit,
                    userId: user.id
                },
                attributes: ['id'],
                include: [{
                    model: models.user,
                    attributes: ['username']
                },
                {
                    model: models.subreddit,
                    attributes: ['name']
                }]
            }).then(mod => {
                console.log(mod);
                if(mod === null) {
                    // This user is not a moderator
                    return res.status(400).end();
                }
                // One final check: is this user already suspended in this sub?
                models.suspension.findOne({
                    where: {
                        userId: target.id,
                        subredditId: req.body.subreddit
                    }
                }).then(suspension => {
                    if(suspension !== null) {
                        let error = {username: 'This user is already banned from this subreddit.'};
                        return res.status(400).json({errors: error})
                    }
                    // All check: user is moderator & specified target exists, now create the suspension
                    let expires = Date.now() + (req.body.duration * 3600000); // Convert the hours to milliseconds
                    let reason = "You were suspended from r/" + mod.subreddit.name + " by the moderator u/" + mod.user.username + " in " + moment().format('MMMM Do, YYYY hh:mma') + "for: \n\n";
                    reason += req.body.reason + "\n\nYou breached rule " + req.body.rule;

                    var suspension = models.suspension.build({
                        moderatorId: mod.id,
                        userId: target.id,
                        subredditId: req.body.subreddit,
                        expires: expires,
                        reason: reason
                    });
                    suspension.save().then(suspension => {
                        console.log('Success');
                        res.status(200).json(suspension)
                    }).catch(error => {
                        res.status(400).json(error);
                    });
                }).catch(error => {
                    console.log(error);
                    res.status(400).json(error);
                });
            }).catch(error => {
                console.log(error);
                res.status(400).json(error);
            });
        }).catch(error => {
            // No user found with this token
            console.log(error);
            res.status(400).json(error);
        })
    }).catch(error => {
        // Error fetching username
        console.log(error);
        return res.status(400).json(error);
    });
});

router.post('/moderator/rule', session_check, async (req, res, next) => {
    // Check for missing req body params
    const requiredKeys = ['token', 'title', 'description', 'title', 'subreddit'];
    var errors = {};
    requiredKeys.forEach(key => {
        if(req.body[key] === undefined || !req.body[key] || req.body[key] === 0) {
            errors[key] = "The " + key + " is required";
        }
    })
    if(Object.keys(errors).length > 0) {
        console.log('Errors: ', errors);
        return res.status(400).json(errors);
    }

    // The rule number is always count of rules in this sub + 1, so we need to get the count first
    var count = await models.rule.count({ where: { subredditId: req.body.subreddit }});
    
    var rule = models.rule.build({
        title: req.body.title,
        description: req.body.description,
        number: count + 1,
        type: req.body.type,
        subredditId: req.body.subreddit
    });
    rule.save().then(rule => {
        res.status(200).json(rule);
    }).catch(error => {
        res.status(400).json(error);
    });
});   

router.delete('/moderator/suspension/:id', (req, res, next) => {
    if(!req.params.id || req.params.id === 0) {
        let errors = {username: 'The user id is required'};
        return res.status(400).json(errors);
    }

    models.suspension.findOne({ where: {userId: req.params.id} }).then(suspension => {
        return suspension.destroy();
    }).then(() => {
        // Chained promise: suspension is now destroyed
        res.status(200).end();
    }).catch(error => {
        res.status(200).json(error);
    });
});   

router.delete('/moderator/rule/:id/', (req, res, next) => {
    
    if(!req.params.id || req.params.id === 0) {
        let errors = {rule: 'The rule is required'};
        return res.status(400).json(errors);
    }

    models.findOne({ where: {id: req.body.rule} }).then(rule => {
        return rule.destroy();
    }).then(() => {
        // Chained promise: rule is now destroyed
        res.status(200).end();
    }).catch(error => {
        res.status(200).json(error);
    });
});   


router.get('/moderator/:subreddit/:token', session_check, (req, res, next) => {
    tokenToUser(token).then(user => {
        models.moderator.findOne({
            where: {
                subredditId: req.params.subreddit,
                userId: user.id
            }
        }).then(results => {
            res.status(200).json(results);
        }).catch(error => {
            res.status(400).json(error);
        });
    }).catch(error => {
        // No user found with this token
        res.status(400).json(error);
    });
}); 

router.get('/user/:username', async (req, res) => {
    var user = await models.user.findOne({ 
        raw: true, 
        where: {username: req.params.username},
        attributes: { exclude: ['password'] }
    });
    if(user === null) {
        return res.status(400).json({errors: {username: 'User not found'}});
    }
    
    var posts = await models.user.getBriefPosts(req.params.username, 10);

    // Those don't contain slugs because are acquired from raw SQL queries, and as such
    // the Sequelize getter methods aren't performed. We will add the slug to each row manually
    async.each(posts, (post, callback) => {
        post.slug = slug(post.title).toLowerCase();
        callback();
    }, () => {
        user.createdAtFormatted = moment(user.createdAt, 'YYYY-MM-DDTHH:mm', false).format('MMMM Do, YYYY hh:mma')
        user.posts = posts;
        // OK
        res.status(200).json(user);
    });
});
module.exports = router;