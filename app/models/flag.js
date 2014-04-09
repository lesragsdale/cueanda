'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    moment = require('moment'),
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
        type: Number,
        default: function(){ return moment().valueOf(); }
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
