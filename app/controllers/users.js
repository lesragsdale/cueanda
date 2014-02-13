'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    fs = require('fs'),
    gm = require('gm');



/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Update
 */
exports.update = function(req, res, next) {
    //console.log(req.files);
    //console.log(req);
    //res.jsonp({title:"oh shit it worked"});
    
    if(req.files.image.originalFilename != ''){
        var imgPath = req.files.image.path;
        console.log(imgPath);

        gm(imgPath).size(function(err,size){
            if(!err)
                var val = (size.width > size.height? true : false );
                saveImg(val,imgPath,req.user);

        });
    }
    //var imgPath = req.files.image.
    //if(req.files)
    res.redirect('/#!/user/'+req.user.username);
};

var saveImg = function(widthLarger, path, user){
    var rWidth = (widthLarger?[null,null]:[50,200]);
    var rHeight = (widthLarger?[50,200]:[null,null]);

    gm(path).resize(rWidth[0],rHeight[0]).crop(50,50,0,0)
    .write('public/img/user/'+user.username+'-sml.png', function (err) {
      if (!err) console.log('done');
    });

    gm(path).resize(rWidth[1],rHeight[1]).crop(200,200,0,0)
    .write('public/img/user/'+user.username+'-lrg.png', function (err) {
      if (!err) console.log('done');
    });
}

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);
    var message = null;

    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Username already exists';
                    break;
                default:
                    message = 'Please fill all the required fields';
            }

            return res.render('users/signup', {
                message: message,
                user: user
            });
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

exports.show = function(req, res) {
    res.jsonp(req.profile);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            username: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};