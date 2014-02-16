'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Category = mongoose.model('Category'),
    _ = require('lodash');


/**
 * Find category by id
 */
exports.category = function(req, res, next, id) {
    Category.load(id, function(err, category) {
        if (err) return next(err);
        if (!category) return next(new Error('Failed to load category ' + id));
        req.category = category;
        next();
    });
};


exports.getCatForType = function(req, res) {
    Category.find({type:req.type}).sort('name').exec(function(err, categories) {
        if (!err) {
            res.jsonp(categories);
        }
    });
}

/**
 * List of Categories
 */
exports.all = function(req, res) {
    Category.find().sort('-created').exec(function(err, categories) {
        if (!err) {
            res.jsonp(categories);
        }
    });
};