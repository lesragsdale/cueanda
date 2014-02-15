'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Follow Schema
 */
var FollowSchema = new Schema({
    follower: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    followee: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});


/**
 * Statics
 */
FollowSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Follow', FollowSchema);
