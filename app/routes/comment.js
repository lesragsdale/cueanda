'use strict';

// Articles routes use questions controller
var comment = require('../controllers/comment');
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

    app.post('/comment/:questionId',comment.create)
    // Finish with setting up the questionId param
    app.param('questionId', question);

};