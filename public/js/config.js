'use strict';

//Setting up route
angular.module('cueanda').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/articles', {
            templateUrl: 'views/articles/list.html'
        }).
        when('/articles/create', {
            templateUrl: 'views/articles/create.html'
        }).
        when('/articles/:articleId/edit', {
            templateUrl: 'views/articles/edit.html'
        }).
        when('/articles/:articleId', {
            templateUrl: 'views/articles/view.html'
        }).
        when('/user/:userName', {
            templateUrl: 'views/user/view.html'
        }).
        when('/user/:userName/edit', {
            templateUrl: 'views/user/edit.html'
        }).
        when('/list', {
            templateUrl: 'views/question/stream.html'
        }).
        when('/list/:communityId', {
            templateUrl: 'views/question/stream.html'
        }).
        when('/flagged', {
            templateUrl: 'views/question/flagged.html'
        }).
        when('/about', {
            templateUrl: 'views/about.html'
        }).
        when('/', {
            templateUrl: 'views/index.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
angular.module('cueanda').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);