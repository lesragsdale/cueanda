'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Pic = mongoose.model('Pic'),
    _ = require('lodash'),
    fs = require('fs'),
    Q = require('q'),
    gm = require('gm');


/**
 * Find Pic by id
 */
exports.pic = function(req, res, next, id) {
    Pic.load(id, function(err, pic) {
        if (err) return next(err);
        if (!pic) return next(new Error('Failed to load pic ' + id));
        req.pic = pic;
        next();
    });
};

/**
 * Create a pic
 */
exports.create = function(req, res) {

    var pic = new Pic({width:null,height:null});
    var maxWidth = 600;
    console.log(req.files);
    //check if theres an image
    if(req.files.file.originalFilename != ''){
        var imgPath = req.files.file.path;

        //create Object in Mongo
        pic.save(function(err, pic) {
            if (!err) {
                //resize (if needed) and save
                resizeImg(imgPath).then(function(gmOb){
                    gmOb.autoOrient().write(
                            'public/img/qstn/'+pic._id+'.png', 
                            function (err, param) {
                              if(err){ console.log(err); }
                              else {
                                    res.jsonp(pic)
                                }
                            }
                    );
                })
            }
        });
    }

};

var resizeImg = function(img){
    var deferred = Q.defer();
    gm(img).size(function(err,size){
        if(err){ console.log(err); }
        else{
            if(size.width > 600){
                //return gm(img).resize(600);
                deferred.resolve(gm(img).resize(600));
            }else{
                //return gm(img);
                deferred.resolve(gm(img));
            }
        }
    });
    return deferred.promise;
}

/**
 * Delete an pic
 */
exports.destroy = function(req, res) {
    var pic = req.pic;
    var criteria = { picer: req.user._id, picee: req.picee, question: req.question};

    Pic.findOneAndRemove(criteria,function(err){
        if(!err){
            res.jsonp({status:"done"});
        }
    });
};