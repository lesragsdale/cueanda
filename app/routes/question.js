'use strict';

// Articles routes use questions controller
var questions = require('../controllers/question');
var authorization = require('./middlewares/authorization');
var _ = require('lodash');

// Article authorization helpers
var hasAuthorization = function(req, res, next) {
    console.log('hasAuthorization::enter')
	if (req.question.user.id !== req.user.id) {
        console.log('hasAuthorization::user not authorized')
        return res.send(401, 'User is not authorized');
    }
    console.log('hasAuthorization::exit')
    next();
};

var isAdmin = function(req, res, next) {
    console.log('isAdmin::enter')
    if (_.isUndefined(req.user.isAdmin)) {
        console.log('isAdmin::user not authorized')
        return res.send(401, 'User is not authorized');
    }
    console.log('isAdmin::exit')
    next();
};

module.exports = function(app) {

    var communityId = function(req, res, next, id) {
        req.community = id;
        next();
    }

    app.get('/questions', questions.all);
    app.get('/questions/:communityId', questions.all);
    app.post('/questions', authorization.requiresLogin, questions.create);
    app.get('/question/:questionId', questions.show);
    app.put('/questions/:questionId', authorization.requiresLogin, hasAuthorization, questions.update);
    app.del('/questions/:questionId', questions.destroy);

    // Finish with setting up the questionId param
    app.param('questionId', questions.question);
    app.param('communityId', communityId);

};