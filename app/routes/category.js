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

    app.get('/category', category.all);
    //app.post('/category', authorization.requiresLogin, category.create);
    //app.get('/category/:categoryId', category.show);
    //app.put('/category/:categoryId', authorization.requiresLogin, hasAuthorization, category.update);
    //app.del('/category/:categoryId', authorization.requiresLogin, hasAuthorization, category.destroy);

    // Finish with setting up the articleId param
    app.param('categoryId', category.category);

};