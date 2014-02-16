'use strict';

angular.module('cueanda').controller('QuestionController',
	['$scope','$resource', '$routeParams', 
	function($scope, $resource, $routeParams) {
		$scope.questionVariable = "Poo man it works!";
		$scope.activeQuestion = {};
		$scope.disablePopup = false;
		$scope.questionFilter = 'all';
		$scope.currentUser = user;
		console.log($scope.currentUser);

		var Question = $resource(	'questions/:communityId',
									{ communityId: '@community' }, 
									{ update: { method: 'PUT' } }
								);

		var Category = $resource(	'category/:type',
									{ type: '@type' }, 
									{ update: { method: 'PUT' } }
								);

		var Community = $resource(	'community/byName/:communityName',
									{ communityName: '@community' }, 
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

		var Recommend = $resource(	'recommend/:questionId',
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

	    	if($routeParams.communityId){
	    		Community.get({communityName: $routeParams.communityId},function(community){
	    			loadQuestions({communityId: community._id},{type: community.type});
	    		})
	    	}else{
	    		loadQuestions({},{type: 1});
	    	}
	    }

	    var loadQuestions = function(qCriteria, cCriteria){

	    	console.log('question criteria');
	    	console.log(qCriteria);
	    	console.log('category criteria');
	    	console.log(cCriteria);

	    	Question.query( qCriteria ,function(questions) {
	            $scope.questions = questions;
	        });

	        Category.query( cCriteria ,function(categories) {
	            $scope.categories = categories;
	        });
	    }

	    $scope.clickUserLink = function(){
	    	$scope.disablePopup = true;
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
				$scope.activeQuestion.votesByUser =  _.groupBy($scope.activeQuestion.votes,function(vote){return vote.user;});								
			});

		}

		$scope.createComment = function(){

			if(_.isUndefined($scope.activeQuestion.newComment) || $scope.activeQuestion.newComment == ""){
				return;
			}

			var comm = new Comment({
									question: $scope.activeQuestion._id,
									body: $scope.activeQuestion.newComment
								});

			comm.$save(function(response){
				$scope.activeQuestion.newComment = "";
				$scope.activeQuestion.comments = _.union([response],$scope.activeQuestion.comments);
			});
		}

		$scope.sendRecommendations = function(){
			var recommends = $scope.activeQuestion.recommends

			var rec = new Recommend({
				question: $scope.activeQuestion._id,
				recommends: $scope.activeQuestion.recommends
			})

			rec.$save(function(response){
				console.log(response);
			})
		}

		$scope.toggleRecommendSection = function(){
			$(".recommend-well").toggleClass("open");
		}

		$scope.questionModal = function(question){
			if(!$scope.disablePopup){
				$scope.activeQuestion = question;

				var questionVotes = _.filter($scope.activeQuestion.votes,function(vote){ return _.isUndefined(vote.comment); });
				$scope.activeQuestion.votesByUser =  _.groupBy(questionVotes,'user');
				$scope.activeQuestion.currentAnswer = _.find(question.votes,function(vote){
					return vote.user == user._id && _.isUndefined(vote.comment);
				})

				var commentVotes = _.filter($scope.activeQuestion.votes,function(vote){ return !_.isUndefined(vote.comment); });
				var commentVoteGrouped = _.groupBy(commentVotes,'comment');
				$scope.activeQuestion.commentScores = {};
				_.each(commentVoteGrouped, function(votes, key){
					$scope.activeQuestion.commentScores[key] = _.reduce(votes,function(memo, vote){
						return memo + vote.answer;
					},0);
				});

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
