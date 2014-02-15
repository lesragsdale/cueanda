'use strict';

// Articles routes use questions controller
var vote = require('../controllers/vote');
var authorization = require('./middlewares/authorization');

// Article authorization helpers
var hasAuthorization = function(req, res, next) {
	if (req.question.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {

    var question = function(req, res, next, id) {
            req.question = id;
            next();
    };

    var answerOption = function(req, res, next, id) {
            req.answerOption = id;
            next();
    };

    var comment = function(req, res, next, id) {
            req.comment = id;
            next();
    };


    app.post('/vote/:questionId/:answerOption',vote.create)
    app.post('/vote/:questionId/:commentId/:answerOption',vote.createForComment)
    // Finish with setting up the questionId param
    app.param('questionId', question);
    app.param('answerOption', answerOption);
    app.param('commentId', comment);

};