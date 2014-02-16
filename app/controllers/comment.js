'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Comment = mongoose.model('Comment'),
    _ = require('lodash'),
    moment = require('moment');


/**
 * Find comment by id
 */
exports.comment = function(req, res, next, id) {
    Comment.load(id, function(err, comment) {
        if (err) return next(err);
        if (!comment) return next(new Error('Failed to load comment ' + id));
        req.comment = comment;
        next();
    });
};

/**
 * Create a comment
 */
exports.create = function(req, res) {

    console.log(req.body);
    var cObject = {
        created:    moment().valueOf(),
        user:       req.user._id,
        question:   req.question,
        body:       req.body.body
    }

    var comment = new Comment(cObject);

    comment.save(function(err, comment) {
        if (!err) {
            //this is stupid but i have to return it this way because
            //otherwise it wont let me return a custom object for user...smh
            res.jsonp({
                user: _.pick(req.user,['name','username','_id','image']),
                question: comment.question,
                created: comment.created,
                body: comment.body,
                _id: comment._id
            });
        }
    });
};

/**
 * Update a comment
 */
exports.update = function(req, res) {
    var comment = req.comment;

    comment = _.extend(comment, req.body);

    comment.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                comment: comment
            });
        } else {
            res.jsonp(comment);
        }
    });
};

/**
 * Delete an comment
 */
exports.destroy = function(req, res) {
    var comment = req.comment;

    comment.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                comment: comment
            });
        } else {
            res.jsonp(comment);
        }
    });
};

/**
 * Show an comment
 */
exports.show = function(req, res) {
    res.jsonp(req.comment);
};

/**
 * List of Categories
 */
exports.all = function(req, res) {
    Comment.find().sort('-created').populate('user', 'name username').exec(function(err, comments) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(comments);
        }
    });
};