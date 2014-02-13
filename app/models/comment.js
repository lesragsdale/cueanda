'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Comment Schema
 */
var CommentSchema = new Schema({
    body: {
        type: String,
        default: '',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    question: {
        type: Schema.ObjectId,
        ref: 'Question'
    }
});

/**
 * Validations
 */


/**
 * Statics
 */
CommentSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Comment', CommentSchema);
