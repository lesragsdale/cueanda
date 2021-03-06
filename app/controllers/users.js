'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    PassResReq = mongoose.model('PasswordResetRequest'),
    Follow = mongoose.model('Follow'),
    uuid = require('node-uuid'),
    moment = require('moment'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    _ = require('lodash'),
    emailer = require('../services/emailer'),
    gm = require('gm'),
    generatePassword = require('password-generator'),
    imageMagick = gm.subClass({ imageMagick: true });



AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID , secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
var s3 = new AWS.S3();

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

exports.PassReset = function(req, res) {
    if(_.isUndefined(req.query.token)){
        res.redirect('user/password-reset?missingToken=true');
    }else{

        PassResReq.findOne({token:req.query.token}).exec(function(err,prr){
            if(!prr){ res.redirect('user/password-reset?invalidToken=true'); }
            else if( moment().valueOf() - prr.created > 2592000000 ){
                res.redirect('user/password-reset?invalidToken=true');
            }else{

                var genPass = generatePassword(10, false);

                User.findOne({email: prr.email}).exec(function(err, user) {
                    if(err || !user){
                        res.redirect('user/password-reset?issueFindingUser=true');
                    }else{
                        emailer.sendPasswordResetEmail({to:prr.email,name:user.name,password:genPass});

                        user.password = genPass;
                        console.log(genPass)
                        user.save(function(err,newUser){
                            res.redirect('user/password-reset?success=true');
                        });
                    }
                });
            }
        });
    }

};

exports.requestPassResetToken = function(req, res) {
    User.findOne({email: req.body.email}).exec(function(err, user) {
        if(err || !user){
            res.redirect('/forgot-password?fail=true');
        }else{
            var ptoken = uuid.v1();
            var emailObject = {
                to: req.body.email,
                name: user.name,
                token: ptoken
            };
            emailer.sendPasswordResetRequestEmail(emailObject);

            var prr = new PassResReq({email:req.body.email,token: ptoken });
            prr.save(function(err, passrr) { 
                res.redirect('/forgot-password?success=true');
            });
        }
    });
};

/**
 * Show forgot pass form
 */
exports.PassResetPage = function(req, res) {
    res.render('users/passwordReset', {
        title: 'PasswordReset',
        message: req.flash('error'),
        query: req.query
    });
};

/**
 * Show forgot pass form
 */
exports.forgotPass = function(req, res) {
    res.render('users/forgotPass', {
        title: 'ForgotPassword',
        message: req.flash('error'),
        query: req.query
    });
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

    /*var user = {
        bio: req.body.bio,
        name: req.body.name,
        password: req.body.password
    }

    console.log(user);

    User.findByIdAndUpdate(req.user._id, user, function(err, user){
        if(!err){
            console.log('just updated the user..')           
            res.jsonp(_.omit(user,['_v','hashed_password','provider','salt']));
        }
    });*/

    var usr = req.profile;

    usr = _.extend(usr, req.body);

    usr.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                router: router
            });
        } else {
            res.jsonp(usr);
        }
    });
    
    //var imgPath = req.files.image.
    //if(req.files)
    //res.redirect('/#!/user/'+req.user.username);
};

exports.uploadUsrImg = function(req, res, next){
    //console.log(req.files);
    if(req.files.file.originalFilename != ''){
        var imgPath = req.files.file.path;
        console.log(imgPath);

        //gm(imgPath).size(function(err,size){
        imageMagick(imgPath).size(function(err,size){
            if(!err)
                var val = (size.width > size.height? true : false );
                saveImg(val,imgPath,req.user,res);
                deleteOldImages(req.user);
        });
    }
}
var updateUserDoc = function(user,rnd, res){
    User.findByIdAndUpdate(user._id, {image:'https://s3.amazonaws.com/cueanda/usr/'+user.username+rnd}, function(err, user){
        if(!err){
            console.log('just updated the user..')           
            res.jsonp(_.omit(user,['_v','hashed_password','provider','salt']));
        }
    });
}

var deleteOldImages = function(user){
    if(user.image){
        fs.unlink('public/img/user/'+user.image+'-sml.png',function(err){
            if(err){ console.log(err)}
            if(!err){
                console.log('deleted public/img/user/'+user.image+'-sml.png');
                fs.unlink('public/img/user/'+user.image+'-lrg.png',function(err){
                    if(err){ console.log(err)}
                    if(!err){
                        console.log('deleted public/img/user/'+user.image+'-lrg.png');
                    }
                });
            }
        });
    }
}

var saveImg = function(widthLarger, path, user, res){
    var rWidth = (widthLarger?[null,null]:[50,200]);
    var rHeight = (widthLarger?[50,200]:[null,null]);
    var rnd = _.random(100);

    /*gm(path).resize(rWidth[0],rHeight[0]).crop(50,50,0,0)
    .write('public/img/user/'+user.username+rnd+'-sml.jpg', function (err) {
      if (!err) {
            console.log('done');
        }
    });*/

    //gm(path).resize(rWidth[0],rHeight[0]).crop(50,50,0,0)
    imageMagick(path).resize(rWidth[0],rHeight[0]).crop(50,50,0,0)
    .stream(function(err, stdout, stderr) {

        var buf = new Buffer(0);
        stdout.on('data', function(d) { buf = Buffer.concat([buf, d]); });
        stdout.on('end', function() {

          var data = {
            Bucket: "cueanda",
            Key: "usr/"+user.username+rnd+"-sml.jpg",
            Body: buf,
            ContentType: 'image/jpeg'
          };

          s3.client.putObject(data, function(err, resp) {
            if(err){console.log(err)}
            console.log("Amazon done");
          });

        });
    });


    //updateUserDoc(user,rnd, res);
    //gm(path).resize(rWidth[1],rHeight[1]).crop(200,200,0,0)
    imageMagick(path).resize(rWidth[1],rHeight[1]).crop(200,200,0,0)
    .stream(function(err, stdout, stderr) {

        var buf = new Buffer(0);
        stdout.on('data', function(d) { buf = Buffer.concat([buf, d]); });
        stdout.on('end', function() {

          var data = {
            Bucket: "cueanda",
            Key: "usr/"+user.username+rnd+"-lrg.jpg",
            Body: buf,
            ContentType: 'image/jpeg'
          };

          s3.client.putObject(data, function(err, resp) {
            if(err){console.log(err)}
            updateUserDoc(user,rnd, res);
            console.log("Amazon done");
          });

        });
    });
}

/**
 * Create user
 */
exports.create = function(req, res, next) {
    
    req.body.image = "https://s3.amazonaws.com/cueanda/usr/default";
    var user = new User(req.body);
    var message = null;

    user.username = user.username.toLowerCase().split(" ").join("");

    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Username or Email already exists';
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
            return res.redirect('#!/user/'+user.username+'/edit');
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

exports.userip = function(req, res) {
    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

     res.jsonp({ip:ip});
}

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    var theUser = null;
    User.findOne({username: id}).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));

        theUser = user
        /////////////
        Follow.find({$or: [{follower:theUser._id},{followee:theUser._id}] }).populate('followee', 'name username image').populate('follower', 'name username image').exec(function(err, follows) {            
            theUser.follows = follows;
            req.profile = theUser;
            next();
        });
        ////////////

        //req.profile = user;
        //next();
    });
};