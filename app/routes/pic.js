'use strict';

// Articles routes use articles controller
var pic = require('../controllers/pic');
var authorization = require('./middlewares/authorization');
var connect = require('../../node_modules/express/node_modules/connect')

module.exports = function(app) {

    var picId = function(req, res, next, id) {
        req.pic = id;
        next();
    }

    app.post('/pic', pic.create);
    app.delete('/pic/:picId',connect.bodyParser(),pic.destroy)

    // Finish with setting up the articleId param
    app.param('picId', picId);

};