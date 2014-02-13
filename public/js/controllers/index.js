'use strict';

angular.module('cueanda.system').controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}]);