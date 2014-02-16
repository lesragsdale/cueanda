'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Follow = mongoose.model('Follow'),
    _ = require('lodash');


/**
 * Find follow by id
 */
exports.follow = function(req, res, next, id) {
    Follow.load(id, function(err, follow) {
        if (err) return next(err);
        if (!follow) return next(new Error('Failed to load follow ' + id));
        req.follow = follow;
        next();
    });
};

/**
 * Create a follow
 */
exports.create = function(req, res) {

    var follow = new Follow({follower: req.user._id, followee: req.followee});

    follow.save(function(err, follow) {
        if (!err) {
            //res.jsonp(follow.populate('followee', 'name username image').populate('follower', 'name username image'));
            Follow.findOne({follower: req.user._id, followee: req.followee})
                .populate('followee', 'name username image').populate('follower', 'name username image')
                    .exec(function(err,follow){
                        res.jsonp(follow);
                    })
        }
    });

};

/**
 * Delete an follow
 */
exports.destroy = function(req, res) {
    var follow = req.follow;
    var criteria = { follower: req.user._id, followee: req.followee};

    Follow.findOneAndRemove(criteria,function(err){
        if(!err){
            res.jsonp({status:"done"});
        }
    });
};