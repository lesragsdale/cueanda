'use strict';

// Articles routes use questions controller
var follow = require('../controllers/follow');
var authorization = require('./middlewares/authorization');

module.exports = function(app) {

    var followee = function(req, res, next, id) {
            req.followee = id;
            next();
    };

    app.post('/follow/:followee',follow.create)
    app.delete('/follow/:followee',follow.destroy)
    // Finish with setting up the questionId param
    app.param('followee', followee);

};