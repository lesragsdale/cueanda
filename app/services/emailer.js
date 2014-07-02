'use strict';

var sendgrid_username   = process.env.SENDGRID_USERNAME;
var sendgrid_password   = process.env.SENDGRID_PASSWORD;
var sendgrid   = require('sendgrid')(sendgrid_username, sendgrid_password);
var fromEmail = 'Cueanda.com';
var siteBaseUrl = 'http://cueanda.herokuapp.com/';

exports.sendAccountCreateEmail = function(emailInfo) {
    var email      = new sendgrid.Email();

    //variables
    var to = emailInfo.to;
    var name = emailInfo.name;
    var password = emailInfo.password;

    email.addTo(to);
    email.setFrom(fromEmail);
    email.setSubject('Welcome to Cueanda.com!');
    email.setText('Hello '+name+',\n\nWelcome to Cueanda.com! Get started by visting our site and logging in using your email address with the password given below:\n\npassword: '+password);
    email.setHtml('Hello %name%,<br><br>Welcome to <a href="www.Cueanda.com" target="_new">Cueanda.com</a>! Get started by visting our site and logging in using your email address with the password given below:<br><br>password: <strong>%password%</strong>');
    email.addSubstitution("%name%", name);
    email.addSubstitution("%password%", password);
    email.addHeader('X-Sent-Using', 'SendGrid-API');
    email.addHeader('X-Transport', 'web');
    //email.addFile({path: './gif.gif', filename: 'owl.gif'});

    sendgrid.send(email, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });
};

exports.sendPasswordResetRequestEmail = function(emailInfo) {
    var email      = new sendgrid.Email();

    //variables
    var to = emailInfo.to;
    var name = emailInfo.name
    var token = emailInfo.token

    email.addTo(to);
    email.setFrom(fromEmail);
    email.setSubject('Cueanda password reset request');
    email.setText('Hello '+name+',\n\nYou\'ve requested a password reset. In order to complete this request please go to the link below to verify your email address.:\n\n'+siteBaseUrl+'users/resest-password?token='+token);
    email.setHtml('Hello %name%,<br><br>You\'ve requested a password reset. In order to complete this request please go to the link below to verify your email address.:<br><br>'+siteBaseUrl+'users/resest-password?token=%token%');
    email.addSubstitution("%name%", name);
    email.addSubstitution("%token%", token);
    email.addHeader('X-Sent-Using', 'SendGrid-API');
    email.addHeader('X-Transport', 'web');
    //email.addFile({path: './gif.gif', filename: 'owl.gif'});

    sendgrid.send(email, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });
};


exports.sendPasswordResetEmail = function(emailInfo) {
    var email      = new sendgrid.Email();

    //variables
    var to = emailInfo.to;
    var name = emailInfo.name
    var password = emailInfo.password

    email.addTo(to);
    email.setFrom(fromEmail);
    email.setSubject('Cueanda password reset');
    email.setText('Hello '+name+',\n\nPer your request, we have reset your password to the following:\n\npassword: '+password);
    email.setHtml('Hello %name%,<br><br>Per your request, we have reset your password to the following:<br><br>password: <strong>%password%</strong>');
    email.addSubstitution("%name%", name);
    email.addSubstitution("%password%", password);
    email.addHeader('X-Sent-Using', 'SendGrid-API');
    email.addHeader('X-Transport', 'web');
    //email.addFile({path: './gif.gif', filename: 'owl.gif'});

    sendgrid.send(email, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });
};

exports.sendNewFeedbackAlertEmail = function(emailInfo) {
    var email      = new sendgrid.Email();

    //variables
    var to = emailInfo.to;
    var location = emailInfo.location;
    var name = emailInfo.name

    email.addTo(to);
    email.setFrom(fromEmail);
    email.setSubject('');
    email.setText('Hello '+name+',\n\nA visitor of ('+location+') has left some new feedback for you to review. Login to view their comments.');
    email.setHtml('Hello %name%,<br><br>A visitor of (%location%) has left some new feedback for you to review. Login to view their comments.');
    email.addSubstitution("%name%", name);
    email.addSubstitution("%location%", location);
    email.addHeader('X-Sent-Using', 'SendGrid-API');
    email.addHeader('X-Transport', 'web');
    //email.addFile({path: './gif.gif', filename: 'owl.gif'});

    sendgrid.send(email, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });
};