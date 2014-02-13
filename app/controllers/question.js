'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Question = mongoose.model('Question'),
    Comment = mongoose.model('Comment'),
    Vote = mongoose.model('Vote'),
    _ = require('lodash');


/**
 * Find Question by id
 */
exports.question = function(req, res, next, id) {
    Question.load(id, function(err, question) {
        if (err) return next(err);
        if (!question) return next(new Error('Failed to load question ' + id));
        req.question = question;
        next();
    });
};

/**
 * Create a question
 */
exports.create = function(req, res) {
    var question = new Question(req.body);
    question.user = req.user;

    question.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                question: question
            });
        } else {
            res.jsonp(question);
        }
    });
};

/**
 * Update a question
 */
exports.update = function(req, res) {
    var question = req.question;

    var updateBody = _.omit(req.body,'_id');

    Question.findByIdandUpdate(question._id, updateBody, function(err, question){
        if(!err){
            console.log(question)
            res.jsonp(question);
        }
    })
};

/**
 * Delete an question
 */
exports.destroy = function(req, res) {
    var question = req.question;

    question.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                question: question
            });
        } else {
            res.jsonp(question);
        }
    });
};

/**
 * Show an question
 */
exports.show = function(req, res) {
    res.jsonp(req.question);
};

/**
 * List of Questions
 */
exports.all = function(req, res) {
    var gQues = [];
    var gVotes = []
    Question.find().sort('-created').populate('user', 'name username').populate('category').exec(function(err, questions) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            gQues = questions;
            Vote.find().exec(function(err2, votes) {
                if (err2) { res.render('error', { status: 500 });
                } else {
                    gVotes = votes
                    Comment.find().populate('user', 'name username').exec(function(err3, comments) {
                        if (err3) { res.render('error', { status: 500 });
                        } else {
                            var vPerQuestion = _.groupBy(gVotes,'question');
                            var cPerQuestion = _.groupBy(comments,'question');
                    
                            var questions = _.map(gQues,function(question){
                                return _.assign(question,{
                                                            votes:vPerQuestion[question._id],
                                                            comments:cPerQuestion[question._id],
                                                          });
                            })

                            res.jsonp(questions);
                        }
                    });
                }
            });
            //res.jsonp(questions);
        }
    });
};