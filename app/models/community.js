'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Community Schema
 */
var CommunitySchema = new Schema({
    type: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    path: {
        type: String,
        default: '',
        trim: true
    },
});


/**
 * Statics
 */
CommunitySchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Community', CommunitySchema);
