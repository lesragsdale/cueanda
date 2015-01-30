'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Recommend Schema
 */
var RecommendSchema = new Schema({
    recommender: {
        type: Schema.ObjectId,
        ref: 'User',
        index: true
    },
    recommendee: {
        type: Schema.ObjectId,
        ref: 'User',
        index: true
    },
    question: {
        type: Schema.ObjectId,
        ref: 'Question',
        index: true
    }
});


/**
 * Statics
 */
RecommendSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Recommend', RecommendSchema);
