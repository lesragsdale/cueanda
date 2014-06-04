'use strict';

angular.module('cueanda.system').controller('HeaderController', ['$scope', 'Global','$location', function ($scope, Global, $location) {
    $scope.global = Global;

    $scope.menu = [{
        'title': 'Articles',
        'link': 'articles'
    }, {
        'title': 'Create New Article',
        'link': 'articles/create'
    }];

    $scope.path = 'http://'+$location.host()+':'+$location.port()+'/';
    
    $scope.isCollapsed = false;
}]);