'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Vote = mongoose.model('Vote'),
    _ = require('lodash');


/**
 * Find vote by id
 */
exports.vote = function(req, res, next, id) {
    Vote.load(id, function(err, vote) {
        if (err) return next(err);
        if (!vote) return next(new Error('Failed to load vote ' + id));
        req.vote = vote;
        next();
    });
};

/**
 * Create a vote
 */
exports.create = function(req, res) {

    var voteObject = {
        question : req.question,
        user : req.user._id,
        answer : req.answerOption
    };

    var criteria = {question:req.question,user:req.user._id};
    var options = { upsert: true}

    Vote.findOneAndUpdate( criteria, voteObject, options,function(err, vote){
        res.jsonp(vote);
    })

};

exports.createForComment = function(req, res) {

    var voteObject = {
        question : req.question,
        comment : req.comment,
        user : req.user._id,
        answer : req.answerOption
    };

    var criteria = {question:req.question, user:req.user._id, comment: req.comment};
    var options = { upsert: true}

    Vote.findOneAndUpdate( criteria, voteObject, options,function(err, vote){
        res.jsonp(vote);
    })

};

/**
 * Update a vote
 */
exports.update = function(req, res) {
    var vote = req.vote;

    vote = _.extend(vote, req.body);

    vote.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                vote: vote
            });
        } else {
            res.jsonp(vote);
        }
    });
};

/**
 * Delete an vote
 */
exports.destroy = function(req, res) {
    var vote = req.vote;

    vote.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                vote: vote
            });
        } else {
            res.jsonp(vote);
        }
    });
};

/**
 * Show an vote
 */
exports.show = function(req, res) {
    res.jsonp(req.vote);
};

/**
 * List of Categories
 */
exports.all = function(req, res) {
    Vote.find().sort('-created').populate('user', 'name username').exec(function(err, votes) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(votes);
        }
    });
};