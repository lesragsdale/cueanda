'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Question Schema
 */
var QuestionSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    question: {
        type: Schema.Types.Mixed
    },
    answers: [],
    category: {
        type: Schema.ObjectId,
        ref: 'Category'
    },
    community: {
        type: Schema.ObjectId,
        ref: 'Community'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    privateList: [],
    comments:[],
    votes:[],
    recommendations:[]
});

/**
 * Validations
 */
 /*
QuestionSchema.path('title').validate(function(title) {
    return title.length;
}, 'Title cannot be blank');*/

/**
 * Statics
 */
QuestionSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').populate('category', 'name').exec(cb);
};

mongoose.model('Question', QuestionSchema);
