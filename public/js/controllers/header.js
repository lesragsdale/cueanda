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

    $scope.enableNewCss = function(){
        $('body').toggleClass('newLayout');
        if($('body').hasClass('newLayout')){
            $('input').removeClass('dark-input');
        }else{
            $('input').addClass('dark-input');
        }
    };

    $scope.path = 'http://'+$location.host()+':'+$location.port()+'/';
    
    $scope.isCollapsed = false;
}]);