'use strict';

// User routes use users controller
var users = require('../controllers/users');
//var bodyParser = require('../../node_modules/express/node_modules/connect/lib/middleware/bodyParser')
var connect = require('../../node_modules/express/node_modules/connect')

var isAdminOrSelf = function(req, res, next) {
    //doACheck
    if(
        req.user.isAdmin || // You're admin, do as you wish
        (  req.user.username === req.profile.username && !req.body.password ) || //you're you and you're not messing with the password
        (  req.user.username === req.profile.username && req.body.password  && req.profile.authenticate(req.body.currentPass)  ) //you're you and you ARE messing with the password
    )
    { next() }
    else{
        return res.send(401, 'User is not authorized');
    }
};

module.exports = function(app, passport) {

    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/forgot-password', users.forgotPass);
    app.get('/users/password-reset', users.PassReset);
    app.get('/user/password-reset', users.PassResetPage);
    app.get('/signout', users.signout);
    app.get('/userip', users.userip);
    app.get('/users/me', users.me);
    app.get('/user/:userId', users.show);

    app.post('/users/requestPasswordToken', users.requestPassResetToken);

    app.post('/user/:userId',connect.bodyParser(), isAdminOrSelf, users.update);
    //uploadUsrImg
    app.post('/user/:userId/img',connect.bodyParser(),users.uploadUsrImg);
    // Setting up the users api
    app.post('/users', users.create);

    // Setting up the userId param
    app.param('userId', users.user);

    // Setting the local strategy route
    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: true
    }), users.session);

    // Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the linkedin oauth routes
    app.get('/auth/linkedin', passport.authenticate('linkedin', {
        failureRedirect: '/signin',
        scope: [ 'r_emailaddress' ]
    }), users.signin);

    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
        failureRedirect: '/siginin'
    }), users.authCallback);

};
