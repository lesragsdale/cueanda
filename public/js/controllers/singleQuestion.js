'use strict';

angular.module('cueanda').controller('SingleQuestionController',
	['$scope', '$location', '$http', '$routeParams', '$timeout', '$window', '$filter', '$sce',
	function($scope, $location, $http, $routeParams, $timeout, $window, $filter, $sce) {
		$scope.currentUser = user;
		$scope.uniqueName = 'rq';

		$scope.loadQuestion = function(){
			console.log($routeParams);
			$http.get('question/'+$routeParams.questionId).success(function(theQuestion){
				console.log(theQuestion);
				$scope.activeQuestion = theQuestion;
				$scope.activeQuestion.question.mainInputPlain = $scope.activeQuestion.question.mainInput;
				$scope.activeQuestion.question.mainInput = $sce.trustAsHtml($filter('mentionLinks')($scope.activeQuestion.question.mainInput));

				$scope.activeQuestion.answers = _.map($scope.activeQuestion.answers,function(anAnswer){
					return _.assign(anAnswer, {mainInput: $sce.trustAsHtml($filter('mentionLinks')(anAnswer.mainInput)) });
				});

				//CODE REPEATED IN question-list.js
				var questionVotes = _.filter($scope.activeQuestion.votes,function(vote){ return _.isUndefined(vote.comment); });
				$scope.activeQuestion.votesByUser =  _.groupBy(questionVotes,function(vote){return (vote.user? vote.user._id : vote.anon);});
				$scope.activeQuestion.currentAnswer = _.find($scope.activeQuestion.votes,function(vote){
					return compareUserAnswer(vote) && _.isUndefined(vote.comment);
				});
				$scope.activeQuestion.userImagePath = $scope.activeQuestion.user.image+'-sml.jpg';

				$(".recommend-well").removeClass("open");
				var commentVotes = _.filter($scope.activeQuestion.votes,function(vote){ return !_.isUndefined(vote.comment); });
				var commentVoteGrouped = _.groupBy(commentVotes,'comment');

				$scope.activeQuestion.comments = _.map($scope.activeQuestion.comments,function(comment){
					if( _.isUndefined(commentVoteGrouped[comment._id]) ){
						comment.score = 0;
					}else{	
						comment.score = _.reduce(commentVoteGrouped[comment._id],function(memo, vote){
							return memo + vote.answer;
						},0);
					}
					return comment;							
				});
				//END OF CODE REPEATED IN question-list.js


			}).error(function(data, status, headers, config) {
		      $scope.errorLoadingQuestion = true;
		    });
		};

		var compareUserAnswer = function(vote){
			console.log(vote)
			var ret = false;
			if(user && vote.user){
				ret = vote.user._id == user._id;
			}else if (!user && unAuthUserIp){
				ret = vote.anon == unAuthUserIp;
			}
			return ret;
		}
		

	}]	
);
