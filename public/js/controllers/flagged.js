'use strict';

angular.module('cueanda').controller('FlaggedController',
	['$scope','$resource', '$routeParams', '$timeout', '$http',
	function($scope, $resource, $routeParams, $timeout, $http) {
		$scope.currentUser = user;
		
		var Flag = $resource('flag',
									{ }, 
									{ update: { method: 'PUT' } }
								);

		Flag.query(function(response){
			$scope.flaggedQuestions = _.map(response,function(q){
				return _.assign(q,{flagCount:q.flags.length});
			});
		})

	}]	
);
