'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Recommend = mongoose.model('Recommend'),
    _ = require('lodash');


/**
 * Find Recommend by id
 */
exports.recommend = function(req, res, next, id) {
    Recommend.load(id, function(err, recommend) {
        if (err) return next(err);
        if (!recommend) return next(new Error('Failed to load recommend ' + id));
        req.recommend = recommend;
        next();
    });
};

/**
 * Create a recommend
 */
exports.create = function(req, res) {

    var recommend = new Recommend({recommender: req.user._id, recommendee: req.recommendee, question: req.question});

    recommend.save(function(err, recommend) {
        if (!err) {
            res.jsonp(recommend);
        }
    });

};

exports.createBulk = function(req, res) {

    var recommends = _.map(req.body.recommends,function(rec){
        return new Recommend(
                {
                    recommender: req.user._id,
                    recommendee: rec,
                    question: req.question
                }
            );
    });

    Recommend.create(recommends,function(err){
        if(!err){
            var recs = [];
            for (var i=1; i<arguments.length; ++i) {
                recs.push(arguments[i]);
            }
            res.jsonp({ recommends :recs});
        }
    }); 
}

/**
 * Delete an recommend
 */
exports.destroy = function(req, res) {
    var recommend = req.recommend;
    var criteria = { recommender: req.user._id, recommendee: req.recommendee, question: req.question};

    Recommend.findOneAndRemove(criteria,function(err){
        if(!err){
            res.jsonp({status:"done"});
        }
    });
};