'use strict';

angular.module('cueanda').controller('QuestionController',
	['$scope','$resource', 
	function($scope,$resource) {
		$scope.questionVariable = "Poo man it works!";
		$scope.activeQuestion = {};
		$scope.disablePopup = false;

		var Question = $resource(	'questions/:questionId',
									{ questionId: '@_id' }, 
									{ update: { method: 'PUT' } }
								);

		var Category = $resource(	'category/:categoryId',
									{ categoryId: '@_id' }, 
									{ update: { method: 'PUT' } }
								);

		var Vote = $resource(	'vote/:questionId/:answerOption',
									{ questionId: '@question',answerOption: '@answer' }, 
									{ update: { method: 'PUT' } }
								);

		var Comment = $resource(	'comment/:questionId',
									{ questionId: '@question'}, 
									{ update: { method: 'PUT' } }
								);

		$scope.catIcons = {
			"business_finance": "briefcase",
			"entertainment": "headphones",
			"food_drink": "cutlery",
			"health_fitness": "leaf",
			"just_fun": "thumbs-up",
			"law_justice":"fire"
		};

	    $scope.pullQuestions = function() {
	    	Question.query(function(questions) {
	            $scope.questions = questions;
	        });

	        Category.query(function(categories) {
	            $scope.categories = categories;
	        });
	    }

		$scope.castVote = function(option){

			/*** EXIT IF ANSWER IS NOT NEW ***/
			var oldAnswerExists = false;
			if(!_.isUndefined($scope.activeQuestion.currentAnswer)){
				oldAnswerExists = true;
				if($scope.activeQuestion.currentAnswer.answer == option){
					return;
				}
			}

			/*** PERSIST ANSWER ***/
			var aVote = new Vote({
				question: $scope.activeQuestion._id,
				answer:option
			});
			aVote.$save(function(response){
				$scope.activeQuestion.currentAnswer = response;
				if(oldAnswerExists){
					$scope.activeQuestion.votes = _.reject( $scope.activeQuestion.votes, function(vote){
						return (vote.user == user._id && vote.question == $scope.activeQuestion._id);
					} );
				}				
				$scope.activeQuestion.votes = _.union([response],$scope.activeQuestion.votes);								
			});

		}

		$scope.createComment = function(){
			var comm = new Comment({
									question: $scope.activeQuestion._id,
									body: $scope.activeQuestion.newComment
								});

			comm.$save(function(response){
				$scope.activeQuestion.newComment = "";
				$scope.activeQuestion.comments = _.union([response],$scope.activeQuestion.comments);
			});
		}

		$scope.questionModal = function(question){
			if(!$scope.disablePopup){
				$scope.activeQuestion = question;
				$scope.activeQuestion.currentAnswer = _.find(question.votes,function(vote){
					return vote.user == user._id;
				})
				$("#viewQuestion").modal("show");
			}else{$scope.disablePopup = false;}
		}

		$scope.createQuestion = function() {
			var question = new Question({
				title: $scope.newQuestion.question,
				answers: [ 
							{title:$scope.newQuestion.optionA}, 
							{title:$scope.newQuestion.optionB}
						]
			});
			question.$save(function(response) {
				//$location.path('question/' + response._id);
			});

		};

	}]	
);
