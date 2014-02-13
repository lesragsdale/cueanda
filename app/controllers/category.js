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

/**
 * Create a category
 */
exports.create = function(req, res) {
    var category = new Category(req.body);

    category.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                category: category
            });
        } else {
            res.jsonp(category);
        }
    });
};

/**
 * Update a category
 */
exports.update = function(req, res) {
    var category = req.category;

    category = _.extend(category, req.body);

    category.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                category: category
            });
        } else {
            res.jsonp(category);
        }
    });
};

/**
 * Delete an category
 */
exports.destroy = function(req, res) {
    var category = req.category;

    category.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                category: category
            });
        } else {
            res.jsonp(category);
        }
    });
};

/**
 * Show an category
 */
exports.show = function(req, res) {
    res.jsonp(req.category);
};

/**
 * List of Categories
 */
exports.all = function(req, res) {
    Category.find().sort('-created').exec(function(err, categories) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(categories);
        }
    });
};