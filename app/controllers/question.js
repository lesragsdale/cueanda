              'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Question = mongoose.model('Question'),
    Comment = mongoose.model('Comment'),
    Follow = mongoose.model('Follow'),
    Vote = mongoose.model('Vote'),
    Recommend = mongoose.model('Recommend'),
    Q = require('q'),
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

    Question.findByIdAndUpdate(question._id, updateBody, function(err, question){
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

/*
    Start with this:
    MyModel.find(query, fields, { skip: 10, limit: 5 }, function(err, results) { ... }
    need to keep track of the "skip" value on the front end...

    inside the sucess callback...get an array of QuestionIds and use that to filter the results
    for everything else: votes, comments, recommendations, etc...
*/

var privacyExp = function(req){
    var b =  {$or: 
                [   
                    {isPrivate: {$exists:false}},
                    {isPrivate: false},
                    {$and:
                        [
                            {isPrivate: true},
                            {privateList: req.user._id}
                        ]
                    },
                    {$and:
                        [
                            {isPrivate: true},
                            {user: req.user._id}
                        ]
                    }
                ]
            };
    
    return b;
}

var buildCriteria = function(req){
    var deferred = Q.defer();

    var criteria = []

    getListOfQuestionsUserVoted({req:req}) //Fetch list of voted questions if needed
        .then(function(pass){
            getArrayOfUsersFollowed(pass)
                .then(function(pass){
                    getRecommendedQuestions(pass)
                        .then(function(pass){

                            //Categories
                            if(req.query.categories){ 
                                console.log(req.query.categories);
                                if(!Array.isArray(req.query.categories)){ req.query.categories = [req.query.categories]; }
                                criteria.push({category:{$in: req.query.categories }}); 
                            }

                            //Private and Recommended
                            if(req.query.privateRecommended){ 
                                criteria.push({$or:[
                                        {isPrivate:true},
                                        {_id:{$in: pass.recommendedQuestions}}
                                    ]});
                             }

                            //if we're getting questions from users you follow
                            if(req.query.followedUsers){ criteria.push({user :{$in: pass.followedUsers}}); }

                            //Handle Community Logic
                            if(req.community){ criteria.push({community: req.community}); }
                            else{ criteria.push({community : {$exists : false} }) }

                            //Keep these last to override other if needed   
                            if(req.query.userAsked){ criteria = [{user : req.query.userAsked }]; }    
                            if(req.query.userVoted){ criteria = [{ _id : { $in: pass.votedQuestions } }]; }

                            criteria.push(privacyExp(req))
                            criteria = {$and: criteria}

                            console.dir(criteria);
                            deferred.resolve(criteria);

                        });
                });
        });

    return deferred.promise;
}

exports.all = function(req, res){
    buildCriteria(req).then(function(criteria){
        Question.find(criteria).sort('-created').populate('user', 'name username image').populate('category').exec(function(err, questions) {
            if (err) { console.log(err); }
            else{
                appendVotes(req,res,questions);
            }
        });
    })
}

var appendVotes = function(req, res, questions){
    Vote.find().exec(function(err2, votes) {
        var vPerQuestion = _.groupBy(votes,'question')
        var questionsOut = _.map(questions,function(question){
            return _.assign(question,{ votes:vPerQuestion[question._id] });
        });
        appendComments(req,res,questionsOut);
    });
}

var appendComments = function(req, res, questions){
    Comment.find().populate('user', 'name username image').exec(function(err3, comments) {
        var cPerQuestion = _.groupBy(comments,'question')
        var questionsOut = _.map(questions,function(question){
            return _.assign(question,{ comments:cPerQuestion[question._id] });
        });
        appendRecommendations(req,res,questionsOut);
    });
}

var appendRecommendations = function(req, res, questions){
    Recommend.find({$or:[ { recommender: req.user._id}, { recommendee: req.user._id} ]})
        .populate('recommender', 'name username image')
            .populate('recommendee', 'name username image').exec(function(err4, recommends){
                var rPerQuestion = _.groupBy(recommends,'question');
                var questionsOut = _.map(questions,function(question){
                    return _.assign(question,{ recommendations:rPerQuestion[question._id] });
                });
                res.jsonp(questionsOut);
    });
}

var getArrayOfUsersFollowed = function(pass){
    var deferred = Q.defer();

    if(pass.req.query.followedUsers){
        var criteria = { follower: pass.req.user._id }
        Follow.find(criteria).exec(function(err,follows){
            var val =  _.map(follows,function(follow){
                    return follow.followee;
                });
            deferred.resolve({req:pass.req, followedUsers: val});
        });
    }else{
        deferred.resolve(pass);
    }

    return deferred.promise;
}

var getRecommendedQuestions = function(pass){
    var deferred = Q.defer();

    if(pass.req.query.privateRecommended){
        var criteria = { recommendee: pass.req.user._id }
        Recommend.find(criteria).exec(function(err,recommends){
            var val =  _.map(recommends,function(recommend){
                    return recommend.question;
                });
            deferred.resolve({req:pass.req, recommendedQuestions: val});
        });
    }else{
        deferred.resolve(pass);
    }

    return deferred.promise;
}


var getListOfQuestionsUserVoted = function(pass){
    var deferred = Q.defer();

    if(pass.req.query.userVoted){
        var criteria = { $and: [ {user: pass.req.user._id}, {comment: {$exists : false}  } ] }
        Vote.find(criteria).exec(function(err,votes){
            var val =  _.map(votes,function(vote){
                    return vote.question;
                });
            deferred.resolve({req:pass.req, votedQuestions: val});
        });
    }else{
        deferred.resolve(pass);
    }

    return deferred.promise;
}

var getVotedQuestionList = function(req, res, userId){

    var criteria = { $and: [ {user: userId}, {comment: {$exists : false}  } ] }

    Vote.find(criteria).exec(function(err,votes){
        var val =  _.map(votes,function(vote){
                return vote.question;
            });

         Question.find({ _id : { $in: val } }).sort('-created').populate('user', 'name username image').populate('category').exec(function(err, questions) {
                if (err) { console.log(err); }
                else{
                    appendVotes(req,res,questions);
                }
            });

    });
}
