'use strict';

// Articles routes use questions controller
var flag = require('../controllers/flag');
var authorization = require('./middlewares/authorization');

module.exports = function(app) {

	var question = function(req, res, next, id) {
            req.question = id;
            next();
    };
    
    app.post('/flag/:question',flag.create)
    app.get('/flag',flag.list)
    // Finish with setting up the questionId param
    app.param('question', question);

};