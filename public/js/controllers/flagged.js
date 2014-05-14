'use strict';

angular.module('cueanda').controller('FlaggedController',
	['$scope','$resource', '$routeParams', '$timeout', '$http','$sce','$filter',
	function($scope, $resource, $routeParams, $timeout, $http, $sce, $filter) {
		$scope.currentUser = user;
		
		var Flag = $resource('flag',
									{ }, 
									{ update: { method: 'PUT' } }
								);

		var makeHtmlContentSafe = function(q){
			q.question.mainInput = $sce.trustAsHtml($filter('mentionLinks')(q.question.mainInput));
			q.answers = _.map(q.answers,function(answer){
				return _.assign(answer, {mainInput:  $sce.trustAsHtml($filter('mentionLinks')(answer.mainInput,false))  });
			});
			return q;
		}

		Flag.query(function(response){
			$scope.flaggedQuestions = _.map(response,function(q){
				q = makeHtmlContentSafe(q);
				return _.assign(q,{flagCount:q.flags.length});
			});
		})

	}]	
);
