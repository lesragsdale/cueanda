'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Flag = mongoose.model('Flag'),
    question = require('../controllers/question'),
    Question = mongoose.model('Question'),
    _ = require('lodash');


/**
 * Find follow by id
 */
exports.follow = function(req, res, next, id) {
    Follow.load(id, function(err, follow) {
        if (err) return next(err);
        if (!follow) return next(new Error('Failed to load follow ' + id));
        req.follow = follow;
        next();
    });
};

/**
 * Create a follow
 */
exports.create = function(req, res) {

    var flag = new Flag({flagger: req.user._id, type: req.body.type, question: req.question});

    flag.save(function(err, flag) {
        if (!err) {
            res.jsonp(flag);
        }
    });

};

exports.list = function(req, res){

    if(_.isUndefined(req.user)){ res.jsonp({error:"you are not authorized"}); }
    else if(_.isUndefined(req.user.isAdmin)){ res.jsonp({error:"you are not authorized"}); }
    else{
        Flag.find().exec(function(err, flags){
            if(err){
                console.log(err);
            }
            else{

                var flagsByQuestion = _.groupBy(flags,'question');

                var criteria = {"_id":{$in: _.map(flags,'question') }}

                Question.find(criteria).populate('user', 'name username image').populate('category').exec(function(err, questions) {
                    if (err) { console.log(err); }
                    else{
                        questions = _.map(questions,function(q){
                            return _.assign(q,{flags:flagsByQuestion[q._id]});
                        });

                        question.appendVotes(req,res,questions);
                    }
                });

            
            }
        });
    }

}