              'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Question = mongoose.model('Question'),
    Comment = mongoose.model('Comment'),
    Follow = mongoose.model('Follow'),
    User = mongoose.model('User'),
    Flag = mongoose.model('Flag'),
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
    
    getAllMentions(question).then(function(mentions){
        console.log(mentions);
        question.mentions = mentions;
        question.save(function(err, qstn) {
            if (err) {
                console.log(err)
                return res.send('users/signup', {
                    errors: err.errors,
                    question: question
                });
            } else {
                Question.find({"_id":qstn._id}).sort('-created').populate('user', 'name username image').populate('category').exec(function(err, questions) {
                    if (err) { console.log(err); }
                    else{
                        exports.appendVotes(req,res,questions);
                    }
                });
            }
        });

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
    //var question = req.question;

    // For some reason req.question does not have the question object stored in it. I dont know why
    // so lets pull it on our own


    Question.load(req.question, function(err, question) {

        if(req.user.isAdmin || (req.user._id.toString() === question.user._id.toString()) ){
            Comment.remove({question: question},function(err){
                if(err){
                    console.log(err);
                }
            });

            Flag.remove({question: question},function(err){
                if(err){
                    console.log(err);
                }
            });

            Recommend.remove({question: question},function(err){
                if(err){
                    console.log(err);
                }
            });

            Vote.remove({question: question},function(err){
                if(err){
                    console.log(err);
                }
            });

            Question.remove({_id: question},function(err){
                if(err){
                    console.log(err);
                }else{
                    res.jsonp(question);
                }
            });
        }else{
            return res.send(401, 'User is not authorized');
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

    var userId = getUserFromReq(req);

    var b =  {$or: 
                [   
                    {isPrivate: {$exists:false}},
                    {isPrivate: false},
                    {$and:
                        [
                            {isPrivate: true},
                            {privateList: userId}
                        ]
                    },
                    {$and:
                        [
                            {isPrivate: true},
                            {user: userId}
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

                            //Get afer a certain created Date
                            if(req.query.timeLoaded){
                                var cQuery;
                                if(req.query.afterTimeLoaded){ cQuery = {'$gt': parseInt(req.query.timeLoaded) } }
                                else{ cQuery = {'$lt': parseInt(req.query.timeLoaded) } }
                                criteria.push({created:cQuery});
                            }   

                            //Keep these last to override other if needed   
                            if(req.query.userAsked){ criteria = [{user : req.query.userAsked }]; }    
                            if(req.query.userVoted){ criteria = [{ _id : { $in: pass.votedQuestions } }]; }
                            if(req.query.userMentioned){ criteria = [{ mentions : req.query.userMentioned }]; }

                            criteria.push(privacyExp(req))
                            criteria = {$and: criteria}

                            deferred.resolve(criteria);

                        });
                });
        });

    return deferred.promise;
}

exports.all = function(req, res){
    buildCriteria(req).then(function(criteria){
        var pageLength = 20;
        var skip = (req.query.page? pageLength*req.query.page :0)
        Question.find(criteria, null, {skip:skip,limit:pageLength}).sort('-created').populate('user', 'name username image').populate('category').exec(function(err, questions) {
            if (err) { console.log(err); }
            else{
                exports.appendVotes(req,res,questions);
            }
        });
    })
}

exports.appendVotes = function(req, res, questions){
    Vote.find().exec(function(err2, votes) {
        var vPerQuestion = _.groupBy(votes,'question')
        var questionsOut = _.map(questions,function(question){
            return _.assign(question,{ votes:vPerQuestion[question._id] });
        });
        appendComments(req,res,questionsOut);
    });
}

var appendComments = function(req, res, questions){
    Comment.find({'question':{$in: _.pluck(questions,'_id') }}).populate('user', 'name username image').exec(function(err3, comments) {
        var cPerQuestion = _.groupBy(comments,'question')
        var questionsOut = _.map(questions,function(question){
            return _.assign(question,{ comments:cPerQuestion[question._id] });
        });
        appendFlags(req,res,questionsOut);
    });
}

var appendFlags = function(req, res, questions){
    Flag.find({'question':{$in: _.pluck(questions,'_id') }}).exec(function(err3, flags) {
        var vPerQuestion = _.groupBy(flags,'question')
        var questionsOut = _.map(questions,function(question){
            return _.assign(question,{ flags:vPerQuestion[question._id] });
        });
        appendRecommendations(req,res,questionsOut);
    });
}

var appendRecommendations = function(req, res, questions){
    var userId = getUserFromReq(req);
    Recommend.find([
                    {
                        $or:
                            [ 
                                { recommender: userId}, 
                                { recommendee: userId}
                            ]
                    },
                    {'question':{$in: _.pluck(questions,'_id') }}
                  ])
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

    var userId = getUserFromReq(pass.req);
    if(pass.req.query.followedUsers){
        var criteria = { follower: userId }
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

    var userId = getUserFromReq(pass.req);
    if(pass.req.query.privateRecommended){
        var criteria = { recommendee: userId}
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
    var userId = (pass.req.query.userVoted ? pass.req.query.userVoted: getUserFromReq(pass.req) );
    if(pass.req.query.userVoted){
        var criteria = { $and: [ {user: userId}, {comment: {$exists : false}  } ] }
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

var getAllMentions = function(q){
    var deferred = Q.defer();

    var fields = [q.question.mainInput];
    _.each(q.answers,function(action){
        fields.push(action.mainInput);
    });

    var mentions = [];
    _.each(fields,function(field){
        mentions = _.union(mentions, getListOfMentions(field) );
    });

    mentions = _.uniq(mentions);

    User.find({username:{$in:mentions}}).exec(function(err, users){
        var val = _.pluck(users,'_id')
        val = _.map(val,function(v){ return v.toString(); });
        deferred.resolve(val);
    });

    return deferred.promise;
};

var getListOfMentions = function(input) {

    var calcEnd = function(text, start){

        var cmpFnc = function (a, b) {
          if (a < b){ return -1; }
          if (a > b){  return 1; }
          return 0;
        };

        var at = (text.substring(start+1).indexOf('@') !== -1 ? text.substring(start+1).indexOf('@')+1 : false);
        var lookFor = [' ','?','.','!',','];
        lookFor = _.map(lookFor,function(charac){
            var dex = text.substring(start).indexOf(charac);
            return (dex === -1?false:dex);
        });
        lookFor = _.compact(_.union([at],lookFor));
        if(_.isEmpty(lookFor)){ return text.length; }
        else{
                lookFor.sort(cmpFnc);
                var dex = lookFor[0];
        }

        return dex+start;
    };

    var currentSpot = 0;
    var output = [];
    while( input.substring(currentSpot).indexOf('@') > -1){
        var pInput = input.substring(currentSpot);
        //console.log(pInput);
        var start = pInput.indexOf('@');
        //console.log(start);
        var end = calcEnd(pInput,start)
        //console.log(end);
        output.push(pInput.substring(start+1,end));
        //console.log(output);
        currentSpot += end;
        //console.log(currentSpot);
    }
    console.log(input);
    console.log(output);
    return output;
};

var getUserFromReq = function(req){
    return (_.isUndefined(req.user)? undefined : req.user._id.toString());     
}
