'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    moment = require('moment'),
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
        type: Number,
        default: function(){ return moment().valueOf(); }
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    question: {
        type: Schema.ObjectId,
        ref: 'Question',
        index: true
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
