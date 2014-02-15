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
        ref: 'User'
    },
    recommendee: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    question: {
        type: Schema.ObjectId,
        ref: 'Question'
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
