'use strict';

// Articles routes use questions controller
var questions = require('../controllers/question');
var authorization = require('./middlewares/authorization');

// Article authorization helpers
var hasAuthorization = function(req, res, next) {
	if (req.question.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
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
    app.get('/questions/:questionId', questions.show);
    app.put('/questions/:questionId', authorization.requiresLogin, hasAuthorization, questions.update);
    app.del('/questions/:questionId', authorization.requiresLogin, hasAuthorization, questions.destroy);

    // Finish with setting up the questionId param
    app.param('questionId', questions.question);
    app.param('communityId', communityId);

};