'use strict';

angular.module('cueanda').controller('FAQController',
	['$scope', '$location', '$anchorScroll',
	function($scope, $location, $anchorScroll) {
		$scope.currentUser = user;
		
		$scope.slideTo = function(id){
			$location.hash(id);
			$anchorScroll();
		}
		

	}]	
);
