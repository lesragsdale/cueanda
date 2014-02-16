'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Community = mongoose.model('Community'),
    _ = require('lodash');


/**
 * Find community by id
 */
exports.community = function(req, res, next, id) {
    Community.load(id, function(err, community) {
        if (err) return next(err);
        if (!community) return next(new Error('Failed to load community ' + id));
        req.community = community;
        next();
    });
	/*Community.findOne({path:id},function(err, community){
		if (err) return next(err);
        if (!community) return next(new Error('Failed to load community ' + id));
        req.community = community;
        next();
	})*/
};


exports.getOne = function(req, res) {
    Community.findOne({path:req.community},function(err, community){
        if (err) return next(err);
        if (!community) return next(new Error('Failed to load community ' + id));
        res.jsonp(community);
    })
};

/**
 * Show an community
 */
exports.show = function(req, res) {
    res.jsonp(req.community);
};
