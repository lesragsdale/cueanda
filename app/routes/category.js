'use strict';

// Articles routes use articles controller
var category = require('../controllers/category');
var authorization = require('./middlewares/authorization');

// Article authorization helpers
var hasAuthorization = function(req, res, next) {
	if (req.user.role == "admin") { //TODO!!
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {

    var type = function(req, res, next, id) {
        req.type = id;
        next();
    }

    app.get('/category', category.all);
    app.get('/category/:type', category.getCatForType)

    // Finish with setting up the articleId param
    app.param('type', type);

};