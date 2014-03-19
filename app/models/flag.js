'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Flag Schema
 */
var FlagSchema = new Schema({
    flagger: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        default: '',
        trim: true
    },
    question: {
        type: Schema.ObjectId,
        ref: 'Question'
    },
    created: {
        type: Date,
        default: Date.now
    }
});


/**
 * Statics
 */
FlagSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Flag', FlagSchema);
