'use strict';

angular.module('cueanda').directive('questionList',['$resource', '$timeout', '$window', '$filter', '$sce',
	function($resource, $timeout, $window, $filter, $sce) {
		return {
			scope:{
				questions: "=",
				uniqueName: "=",
				query:"=",
				usePager:"=",
				flagged:"="
			},
			restrict: 'E',
			replace: true,
			templateUrl: 'views/question/question-list.html',
			link: function(scope, element, attrs) {

				$timeout(function(){
	            	$(".hasTooltip").tooltip();
	            },500);

	           	scope.$watch(attrs.questions, function(value) {
	           		setMentionLinkClickAction();
				});


				var Question = $resource(	'questions/:id',
											{ id: '@id' }, 
											{ update: { method: 'PUT' } }
										);

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

				if(user){
					//get users that user follows
					var mentionUsers = _.filter(user.follows,function(follow){ return follow.follower._id === user._id; });
					//turn the image field into an actual image url
					//remove username from name if it exists because it messes up mention.js
					mentionUsers = _.map( mentionUsers, function(f){ 
						f.followee.fakeName = f.followee.name.toLowerCase().replace(f.followee.username.toLowerCase(),'');
						return  f.followee.image.substr(-4) === '.jpg'? f.followee : _.assign(f.followee,  {image:f.followee.image+'-sml.jpg'}   );
					});
					$("#commentBox").mention({
					    queryBy: ['fakeName','username'],
					    users: mentionUsers
					});					
				}

				var setMentionLinkClickAction = function(){
					$timeout(function(){
						console.log("MENTIONLINKFUNCCALL!");
						$(".mention-link").on('click',function(event){
							$('.modal').modal('hide');
							var elmId = $(this).attr("id");
							scope.disablePopup = true;
							$timeout(function(){
								window.location = "#!/user/"+elmId;
							},500);								
						});
		            },100);
				}

				scope.$on('enableMentionLinkFunc',function(evt){
					setMentionLinkClickAction();
				});

				scope.currentPage = 0;
				scope.itemsPerPage = 3;
				scope.activeQuestion = {};
				scope.disablePopup = false;
				scope.currentUser = user;
				scope.sortQsBy = (scope.flagged?'-flagCount':'-created');

				scope.reasonForFlagging = 'language';

				scope.getNumber = function() {
					//Math.ceil(scope.questions/scope.itemsPerPage)
					//console.log(Math.ceil(scope.questions.length/scope.itemsPerPage));
					var length = ( _.isUndefined(scope.questions) ? 1 : scope.questions.length)
				    return new Array(Math.ceil(length/scope.itemsPerPage));   
				}

				scope.changePage = function(alter){
					if(alter == -1 && scope.currentPage == 0){return;}
					if(alter == 1 && ((scope.currentPage + 1) >=(scope.questions.length/scope.itemsPerPage))){return;}
					scope.currentPage = scope.currentPage + alter;   
				}

				scope.setPage = function(number){
					scope.currentPage = number;                 
				}

				scope.toggleModal = function(id){
					$('#'+id+scope.uniqueName).modal('toggle');
				}

				scope.catIcons = {
					"business_finance": "fa fa-money",
					"entertainment": "fa fa-ticket",
					"food_drink": "glyphicon glyphicon-cutlery",
					"health_fitness": "fa fa-medkit",
					"just_fun": "fa fa-smile-o",
					"law_justice":"fa fa-gavel",
					"misc":"fa fa-cogs",
					"music":"fa fa-music",
					"politics":"fa fa-dashboard",
					"religion_spirituality":"glyphicon glyphicon-bell",
					"sex_relationships":"glyphicon glyphicon-heart",
					"sports":"fa fa-trophy",
					"technology":"fa fa-rocket",
					"travel":"fa fa-map-marker",
					"academica":"glyphicon glyphicon-book",
					"athletics":"glyphicon glyphicon-road",
					"clubs_organizations":"glyphicon glyphicon-map-marker",
					"gossip":"glyphicon glyphicon-comment",
					"greek_life":"glyphicon glyphicon-font",
					"housing":"glyphicon glyphicon-home",
					"attractions":"glyphicon glyphicon-star",
					"news_politics":"glyphicon glyphicon-print",
					"nightlife":"glyphicon glyphicon-glass",
					"real_estate":"glyphicon glyphicon-globe",
					"draft_central":"glyphicon glyphicon-tasks",
					"drop_keep":"glyphicon glyphicon-trash",
					"head_head":"glyphicon glyphicon-retweet",
					"fashion":"fa fa-cube",
					"start_sit":"glyphicon glyphicon-random"
				};

			    scope.isQuestionRecommended = function(question){
			    	if(!question.recommendations){ return false; }

			    	var val = _.find(question.recommendations,function(v){
			    		return v.recommendee._id == user._id;
			    	});

			    	return (val?true:false);
			    }

			    scope.questionHasEmbed = function(question,type){
			    	var val = false;
		    		if(checkOptionForEmbed(question.question,type)){
		    			return true;
		    		}
			    	_.each(question.answers,function(answer){
			    		if(checkOptionForEmbed(answer,type)){
			    			val = true;
			    		}
			    	});
			    	return val;
			    }

			    var checkOptionForEmbed = function(option, type){
			    	if(_.isUndefined(option.embed)){  return false;	}
			    	var val = (type == 'video'?true:false);
			    	return (option.embed.type == 'video'?val:!val);
			    }			    

			    scope.whoRecommended = function(question){
			    	var out = "Recommended by ";

			    	var recsByRecommendee = _.groupBy(question.recommendations,'recommendee');
			    	var count = 0;
			    	_.each(recsByRecommendee,function(r){
			    		if(count > 0 && count != (_.size(recsByRecommendee) -1)){out+=", "}
			    		if(count == (_.size(recsByRecommendee) -1) &&  count != 0 ){out+=" and "}
			    		out += "<a href='#!/user/"+r.recommender.username+"'>"+r.recommender.username+"</a>";

			    	});
			    }

			    scope.clickUserLink = function(){
			    	scope.disablePopup = true;
			    }

			    scope.goToUser = function(username){
			    	$('.modal').modal('hide');
			    	$timeout(function(){
			    		window.location = "#!/user/"+username;
			    	},500);
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
			    }

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

				scope.hasEmbeds = function(answers){
					//console.log(answers);
					/*
					!_.isUndefined(
				_.find(
						activeQuestion.answers,
						function(d){ return d.showAttach == true; }
					   )
			  )
					*/
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

						alertify.log("Recommendations Sent!", 'standard', 4000);
						$(".recommend-well").removeClass("open");

						$timeout(function(){
							scope.activeQuestion.recommends = [];
						},500)

						scope.activeQuestion.recommendations = _.union(val, scope.activeQuestion.recommendations);
					})
				}

				scope.openWindow = function(a,b,c){
					//http://stackoverflow.com/questions/12547088/how-do-i-customize-facebooks-sharer-php
					a = a.replace("[questionTitle]", encodeURIComponent(scope.activeQuestion.question.mainInput) )

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

				var compareUserAnswer = function(vote){
					var ret = false;
					if(user){
						ret = vote.user == user._id;
					}else{
						ret = vote.anon == unAuthUserIp;
					}
					return ret;
				}

				scope.questionModal = function(question){
					if(!scope.disablePopup){
						scope.activeQuestion = {};
						scope.activeQuestion = question;

						var questionVotes = _.filter(scope.activeQuestion.votes,function(vote){ return _.isUndefined(vote.comment); });
						scope.activeQuestion.votesByUser =  _.groupBy(questionVotes,'user');
						scope.activeQuestion.currentAnswer = _.find(question.votes,function(vote){
							return compareUserAnswer(vote) && _.isUndefined(vote.comment);
						});
						scope.activeQuestion.userImagePath = scope.activeQuestion.user.image+'-sml.jpg';

						$(".recommend-well").removeClass("open");
						var commentVotes = _.filter(scope.activeQuestion.votes,function(vote){ return !_.isUndefined(vote.comment); });
						var commentVoteGrouped = _.groupBy(commentVotes,'comment');
						/*scope.activeQuestion.commentScores = {};
						_.each(commentVoteGrouped, function(votes, key){
							scope.activeQuestion.commentScores[key] = _.reduce(votes,function(memo, vote){
								return memo + vote.answer;
							},0);
						});*/

						scope.activeQuestion.comments = _.map(scope.activeQuestion.comments,function(comment){
							if( _.isUndefined(commentVoteGrouped[comment._id]) ){
								comment.score = 0;
							}else{	
								comment.score = _.reduce(commentVoteGrouped[comment._id],function(memo, vote){
									return memo + vote.answer;
								},0);
							}
							return comment;							
						});

						$("#viewQuestion"+scope.uniqueName).modal("show");
						$("#viewQuestion"+scope.uniqueName+" .buttons .btn").tooltip();
					}else{scope.disablePopup = false;}
				}

			}
		};
	}]
);