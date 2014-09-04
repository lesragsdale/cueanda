'use strict';

angular.module('cueanda').directive('question',['$resource', '$timeout', '$window', '$filter', '$sce',
	function($resource, $timeout, $window, $filter, $sce) {
		return {
			scope: {
				activeQuestion: "="
			},
			restrict: 'E',
			replace: true,
			templateUrl: 'views/question/question.html',
			link: function(scope, element, attrs) {

				var Vote = $resource(	'vote/:questionId/:answerOption',
											{ questionId: '@question',answerOption: '@answer' }, 
											{ update: { method: 'PUT' } }
										);

				var Flag = $resource(	'flag/:questionId',
											{ questionId: '@question' }, 
											{ update: { method: 'PUT' } }
										);

				var Comment = $resource(	'comment/:questionId',
											{ questionId: '@question'}, 
											{ update: { method: 'PUT' } }
										);
				var CommentDel = $resource(	'comment/:commentId',
											{ commentId: '@comment'}, 
											{ update: { method: 'PUT' } }
										);

				var Recommend = $resource(	'recommend/:questionId',
											{ questionId: '@question'}, 
											{ 
												update: { method: 'PUT' }
												//saveBulk: { method: 'POST', isArray: true} 
											}
										);

				scope.submitFlagging = function(){
			    	var aFlag = new Flag({
			    		type: scope.reasonForFlagging,
			    		question: scope.activeQuestion._id,
			    	});

			    	aFlag.$save(function(response){
			    		if(_.isUndefined(scope.activeQuestion.flags)){
			    			scope.activeQuestion.flags = [response];
			    		}else{
			    			scope.activeQuestion.flags.push(response);
			    		}			    		
			    		alertify.log("Flag Submitted!", 'standard', 4000);
			    		$('#flagQuestion'+scope.uniqueName).modal('hide');
			    	})
			    };

			    scope.alreadyFlagged = function(){
			    	if(!user){return;}
			    	var flaggers = _.pluck(scope.activeQuestion.flags,'flagger');
			    	return _.indexOf(flaggers,user._id) >= 0;
			    };

			    scope.filterVotes = function(friendsOnly){
			    	if(friendsOnly){
			    		var peopleIFollow = _.reduce(user.follows,function(memo, follow){
			    			if(follow.follower._id === user._id){
			    				memo.push(follow.followee._id);
			    				return memo;
			    			}else{
			    				return memo;
			    			} 
			    		},[]);			    		

			    		var votesFromFriends = _.filter(scope.activeQuestion.votes,function(vote){
			    			return  _.indexOf(peopleIFollow,vote.user) >= 0;
			    		});

			    		if(_.isEmpty(votesFromFriends)){
			    			alertify.log("None of your friends have answered this question", 'error', 4000);
			    		}else{
			    			scope.activeQuestion.allVotes = scope.activeQuestion.votes
			    			scope.activeQuestion.votes = votesFromFriends;
			    		}			    		
			    	}
			    	else{
			    		scope.activeQuestion.votes = scope.activeQuestion.allVotes;
			    		scope.activeQuestion.allVotes = undefined;
			    	}
			    };

			    scope.castVote = function(option){

					/*** EXIT IF ANSWER IS NOT NEW ***/
					var oldAnswerExists = false;
					if(!_.isUndefined(scope.activeQuestion.currentAnswer)){
						oldAnswerExists = true;
						if(scope.activeQuestion.currentAnswer.answer == option){
							return;
						}
					}

					/*** PERSIST ANSWER ***/
					var aVote = new Vote({
						question: scope.activeQuestion._id,
						answer:option
					});
					aVote.$save(function(response){
						scope.activeQuestion.currentAnswer = response;
						if(oldAnswerExists){
							scope.activeQuestion.votes = _.reject( scope.activeQuestion.votes, function(vote){
								return (compareUserAnswer(vote) && vote.question == scope.activeQuestion._id);
							} );
						}				
						scope.activeQuestion.votes = _.union([response],scope.activeQuestion.votes);
						scope.activeQuestion.votesByUser =  _.groupBy(scope.activeQuestion.votes,function(vote){return vote.user;});								
					});

				}

				scope.createComment = function(){

					if(_.isUndefined(scope.activeQuestion.newComment) || scope.activeQuestion.newComment == ""){
						return;
					}

					var comm = new Comment({
											question: scope.activeQuestion._id,
											body: scope.activeQuestion.newComment
										});

					comm.$save(function(response){
						scope.activeQuestion.newComment = "";

						var safeHtml = $sce.trustAsHtml($filter('mentionLinks')(response.body));
						response = _.assign(response,{body:safeHtml});

						alertify.log("Comment Saved", 'standard', 4000);
						scope.activeQuestion.comments = _.union([response],scope.activeQuestion.comments);

						setMentionLinkClickAction();

					});
				}

				scope.deleteComment = function(){
					var cToDelete = new CommentDel({comment:scope.commentToDelete})
					console.log('getting called')
					cToDelete.$delete(function(reponse){
						scope.toggleModal('deleteComment');
						//$('.modal').modal('hide');

						$('.comment-'+scope.commentToDelete).fadeOut(500,function(){
							alertify.log("Comment Deleted", 'standard', 4000);
							$scope.activeQuestion.comments = _.reject($scope.activeQuestion.comments,function(comment){
								return comment._id == scope.commentToDelete;
							})
						});						
					})
				}

				scope.deleteQuestion = function(){
					var qToDelete = new Question({id:scope.questionToDelete})

					qToDelete.$delete(function(reponse){
						//scope.toggleModal('deleteQuestion');
						$('.modal').modal('hide');

						$('.qli-'+scope.questionToDelete).fadeOut(500,function(){
							alertify.log("Question Deleted", 'standard', 4000);
							$scope.questions = _.reject(question,function(){
								return question._id == scope.questionToDelete;
							})
						});
						

						
					})
				}

				scope.prepareToDelete = function(questionId){
					scope.questionToDelete = questionId;
					scope.toggleModal('deleteQuestion');
				}

				scope.sendRecommendations = function(){
					var recommends = scope.activeQuestion.recommends

					var rec = new Recommend({
						question: scope.activeQuestion._id,
						recommends: scope.activeQuestion.recommends
					})

					rec.$save(function(response){
						//response.recommends
						var val = _.map(response.recommends,function(rec){
							rec.recommender = { _id: rec.recommender }
							rec.recommendee = { _id: rec.recommendee }
							return rec;
						});

						alertify.log("Recommendation sent!", 'standard', 4000);
						$(".recommend-well").removeClass("open");

						$timeout(function(){
							scope.activeQuestion.recommends = [];
						},500)

						scope.activeQuestion.recommendations = _.union(val, scope.activeQuestion.recommendations);
					})
				}

				scope.openWindow = function(a,b,c){
					//http://stackoverflow.com/questions/12547088/how-do-i-customize-facebooks-sharer-php
					a = a.replace("[questionTitle]", encodeURIComponent(scope.activeQuestion.question.mainInputPlain) )
					console.log(scope.activeQuestion.shortUrl);
					a = a.replace("[shortUrl]", encodeURIComponent('http://'+scope.activeQuestion.shortUrl) )

					$window.open(a, b, c);
				}

				scope.toggleRecommendSection = function(){
					$(".recommend-well").toggleClass("open");
				}

				scope.hideRecommendOption = function(followee){
					if(followee === user._id){ return true; }
					if(!scope.activeQuestion.recommendations){ return false; }
					var v = _.find(scope.activeQuestion.recommendations,function(v){ 
							return v.recommendee._id == followee; 
						});
					return (v?true:false);
				}
				
			}
		};
	}]	
);