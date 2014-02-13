'use strict';

angular.module('cueanda').controller('UserController',
	['$scope','$resource', '$routeParams',
	function($scope,$resource,$routeParams) {

		var User = $resource('user/:userName',
									{ userName: '@username' }, 
									{ update: { method: 'POST' } }
								);

		User.get({
            userName: $routeParams.userName
        }, function(user) {
        	//console.log(user);
            $scope.userProfile = user;
        });


        $scope.updateUser  = function(){
        	$scope.userProfile.$update(function(response){
        		console.log('repsonse from user update:');
        		console.log(repsonse);
        	})
        }

	}]	
);
