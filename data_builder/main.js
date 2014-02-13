var path = require('path');
var _ = require('lodash');
var mongodb = require('mongodb');
var qmongo = require('q-mongodb');
var Q = require("q");

var dbUtil = require('./dbUtil.js');
var dataUnits = require('./units.js');
var personnel = require("./personnel.js");
var slots = require("./slots.js");
var equipment = require("./equipment.js");
var gainloss = require("./gainloss.js");
var queryMetadata = require("./queryMetadata.js");
var users = require("./usersAndRoles.js");

process.on('exit', function() {
  console.log('About to exit.');
});

var promises = [];

var multiStep = function(units){
  var promises = [];
  promises.push(users.generateUsers(units));
  promises.push(users.generateRoles());
  console.log("Writing personnel and equipment for units...");
  var unitsRemainingForP = units.length;
  var unitsRemainingForS = units.length;
  var unitsRemainingForGL = units.length;
  _.each(units, function(unit){
    var deferred = Q.defer();
    personnel.generatePersonnelForUnit(unit)
      .then(function(personnelForUnit){
          unitsRemainingForP --;
          if (unitsRemainingForP % 50 === 0){
            console.log( "  Personnel: " + (units.length - unitsRemainingForP) + " units written - " + unitsRemainingForP + " remaining.");
          }
          //console.log ("  Personnel generated, writing slots for " + unit._id);
          return slots.generateSlotsForUnit(personnelForUnit, unit);
      })
      .then(function(personnelAndSlots){
        unitsRemainingForS --;
        if (unitsRemainingForS % 50 === 0){
            console.log( "      Slots: " + (units.length - unitsRemainingForS) + " units written - " + unitsRemainingForS + " remaining.");
        }
        return gainloss.generateGainLossForUnit(unit,_.pluck(units,'_id'),personnelAndSlots[0]);
      })
      .then(function(gainloss){
        unitsRemainingForGL --;
        if (unitsRemainingForGL % 50 === 0){
            console.log( "   GainLoss: " + (units.length - unitsRemainingForGL) + " units written - " + unitsRemainingForGL + " remaining.");
        }
        deferred.resolve();
      });

    promises.push(deferred.promise);

    //console.log("  Writing equipment for " + unit._id);
    promises.push(equipment.createEquipmentForUnit(unit));
  });
  return Q.all(promises);
};

  var multiStepComplete = function(data){
    console.log("Personnel and equipment written!");
  };

var exitGood = function(){
  process.exit(1);
}

var funcs = [dbUtil.dropDatabase, dbUtil.writeServerConfig, queryMetadata.generateDBMetadata, queryMetadata.generateQueryTypes, dataUnits.createUnits, multiStep, multiStepComplete, exitGood];

_.reduce(funcs, Q.when, Q());