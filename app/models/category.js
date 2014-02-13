'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Category Schema
 */
var CategorySchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true
    },
    machine_name: {
        type: String,
        default: '',
        trim: true
    },
    type: {
        type: Number,
        default: 0
    }
});

/**
 * Validations
 */
CategorySchema.path('name').validate(function(name) {
    return name.length;
}, 'Name cannot be blank');

/**
 * Statics
 */
CategorySchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Category', CategorySchema);
