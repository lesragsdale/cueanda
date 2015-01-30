'use strict';

angular.module('cueanda').directive('question',['$resource', '$timeout', '$window', '$filter', '$sce', '$location',
	function($resource, $timeout, $window, $filter, $sce, $location) {
		return {
			scope: {
				activeQuestion: "=",
				uniqueName: "="
			},
			restrict: 'E',
			replace: true,
			templateUrl: 'views/question/question.html',
			link: function(scope, element, attrs) {

				var Vote = $resource(	'vote/:questionId/:answerOption',
											{ questionId: '@question',answerOption: '@answer' }, 
											{ update: { method: 'PUT' } }
										);

				var Question = $resource(	'questions/:id',
											{ id: '@id' }, 
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

				scope.cancelTipper = false;
				scope.aboutToCallTipper = false;
				$(document).on("mouseenter", ".tipper-show-votes",function(e){
					scope.aboutToCallTipper = true;
					$timeout(function(){
						if(scope.cancelTipper){
							scope.cancelTipper = false;
						}else{

							var votes = getVotes();							
							scope.aboutToCallTipper = false;
							var text = _.reduce(_.sortBy(votes[0],function(v){ return v.user.username; }), function(memo, vote){
								return memo + "<div class='vote-nub-holder'><span class='name'>" + vote.user.username + ":</span> <div class='vote-nub vote-sec-"  + vote.answer + "'> </div></div>";
							},"");
							var otherVotes = _.groupBy(votes[1],function(vote){ return vote.answer; });
							text = _.reduce(otherVotes, function(memo, val, key){
								return memo + "<div class='vote-nub-holder'><span class='name'>" + val.length + " users:</span> <div class='vote-nub vote-sec-" + key + "'></div></div>";
							}, text);
							$(".tooltipper .text").html(text);
							$(".tooltipper").addClass("active");

							$(".tooltipper").offset({
								top: $(e.target).offset().top - ($(".tooltipper .text").height() + 32),
								left: $(e.target).offset().left + ($(e.target).width()/2) - ($(".tooltipper").width()/2) 
							})
						}
					},200)
			    });

			    $(document).on("mouseleave", ".tipper-show-votes",function(e){
			    	if(scope.aboutToCallTipper){
			    		scope.cancelTipper = true;
			    		scope.aboutToCallTipper = false;
			    	}
					var answer = $(e.target).attr("answer")
					$(".tooltipper .text").html("")
					$(".tooltipper").removeClass("active");
			    });

			    var getVotes = function(){
			    	var allVotes = _.cloneDeep(scope.activeQuestion.votes)
					if(user){ //Do this only if it's not an anon user
						var whoIFollow = _.map(_.filter(user.follows,function(f){ return f.follower._id == user._id; }), function(aFollow){
							return aFollow.followee._id;
						});
						allVotes = _.groupBy(allVotes,function(vote){
							if(vote.user != null){
								return _.contains(whoIFollow, vote.user._id);
							}else{
								return false;
							}
						});
						var votesFromFriends = allVotes[true];
						var votesFromElse = allVotes[false];
					}else{
						var votesFromFriends = [];
						var votesFromElse = allVotes;
					}

					return [votesFromFriends,votesFromElse]
			    }

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

			    scope.toggleModal = function(id){
					$('#'+id+scope.uniqueName).modal('toggle');
				}

			    scope.alreadyFlagged = function(){
			    	if(!user){return;}
			    	if(!scope.activeQuestion){return;}
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

						if(user){
							response.user = _.pick(user,["_id","username"]);
						}else{
							response.user = null
						}

						scope.activeQuestion.currentAnswer = response;
						if(oldAnswerExists){
							console.log(scope.activeQuestion.votes);
							scope.activeQuestion.votes = _.reject( scope.activeQuestion.votes, function(vote){
								return (compareUserAnswer(vote) && vote.question == scope.activeQuestion._id);
							} );
						}				
						scope.activeQuestion.votes = _.union([response],scope.activeQuestion.votes);
						scope.activeQuestion.votesByUser =  _.groupBy(scope.activeQuestion.votes,function(vote){return (vote.user? vote.user._id : vote.anon);});								
					});

				}

				var compareUserAnswer = function(vote){
					var ret = false;
					if(user && vote.user){
						ret = vote.user._id == user._id;
					}else if (!user && unAuthUserIp){
						ret = vote.anon == unAuthUserIp;
					}
					return ret;
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

				var setMentionLinkClickAction = function(){
					scope.$broadcast('enableMentionLinkFunc');
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

						if($location.path() == '/list'){

							$('.qli-'+scope.questionToDelete).fadeOut(500,function(){
								alertify.log("Question Deleted", 'standard', 4000);
								/*$scope.questions = _.reject(question,function(){
									return question._id == scope.questionToDelete;
								})*/
							});

						}else{
							$location.path('list');
							alertify.log("Question Deleted", 'standard', 4000);
						}
						

						
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