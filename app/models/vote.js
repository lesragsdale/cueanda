'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Vote Schema
 */
var VoteSchema = new Schema({
    answer: {
        type: Number,
        default: 0
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
VoteSchema.path('question').validate(function(question) {
    return question.length;
}, 'question cannot be blank');

/**
 * Statics
 */
VoteSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Vote', VoteSchema);
