'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;


/**
 * Password Request Schema
 */
var PassResReqSchema = new Schema({
    email: {
        type: String,
        default: '',
        trim: true
    },
    token: {
        type: String,
        default: '',
        trim: true
    },
    created: {
        type: Number,
        default: function(){ return moment().valueOf(); }
    }
});


/**
 * Statics
 */
PassResReqSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('PasswordResetRequest', PassResReqSchema);
