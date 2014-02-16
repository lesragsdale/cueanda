'use strict';

// Articles routes use questions controller
var recommend = require('../controllers/recommend');
var authorization = require('./middlewares/authorization');

module.exports = function(app) {

    var recommendee = function(req, res, next, id) {
            req.recommendee = id;
            next();
    };
    var question = function(req, res, next, id) {
            req.question = id;
            next();
    };

    app.post('/recommend/:recommendee/:question',recommend.create)
    app.post('/recommend/:question',recommend.createBulk)
    app.delete('/recommend/:recommendee/:question',recommend.destroy)
    // Finish with setting up the questionId param
    app.param('recommendee', recommendee);
    app.param('question', question);

};