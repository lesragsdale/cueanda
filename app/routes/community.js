'use strict';

// Articles routes use questions controller
var community = require('../controllers/community');
var authorization = require('./middlewares/authorization');


module.exports = function(app) {

	var communityName = function(req, res, next, id) {
		req.community = id;
		next();
	}

    app.get('/community/:communityId',community.show)
    app.get('/community/byName/:communityName',community.getOne)
    // Finish with setting up the questionId param
    app.param('communityId', community.community);
    app.param('communityName', communityName )

};