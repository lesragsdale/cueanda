'use strict';

angular.module('cueanda').directive('questionList',['$resource', '$timeout',
	function($resource, $timeout) {
		return {
			scope:{
				questions: "=",
				uniqueName: "=",
				query:"=",
				usePager:"="
			},
			restrict: 'E',
			replace: true,
			templateUrl: 'views/question/question-list.html',
			link: function(scope, element, attrs) {
				
				$timeout(function(){
	            	$(".hasTooltip").tooltip();
	            },500)

				var Question = $resource(	'questions/:communityId',
											{ communityId: '@community' }, 
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
											{ 
												update: { method: 'PUT' }
												//saveBulk: { method: 'POST', isArray: true} 
											}
										);

				scope.currentPage = 0;
				scope.itemsPerPage = 3;

				scope.activeQuestion = {};
				scope.disablePopup = false;
				scope.currentUser = user;

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

				scope.catIcons = {
					"business_finance": "glyphicon glyphicon-briefcase",
					"entertainment": "glyphicon glyphicon-headphones",
					"food_drink": "glyphicon glyphicon-cutlery",
					"health_fitness": "glyphicon glyphicon-leaf",
					"just_fun": "glyphicon glyphicon-thumbs-up",
					"law_justice":"glyphicon glyphicon-fire",
					"misc":"glyphicon glyphicon-asterisk",
					"music":"glyphicon glyphicon-music",
					"politics":"glyphicon glyphicon-inbox",
					"religion_spirituality":"glyphicon glyphicon-bell",
					"sex_relationships":"glyphicon glyphicon-heart",
					"sports":"glyphicon glyphicon-bullhorn",
					"technology":"glyphicon glyphicon-phone",
					"travel":"fa fa-rocket",
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
					"start_sit":"glyphicon glyphicon-random"
				};

			    scope.isQuestionRecommended = function(question){
			    	if(!question.recommendations){ return false; }

			    	var val = _.find(question.recommendations,function(v){
			    		return v.recommendee._id == user._id;
			    	});

			    	return (val?true:false);
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
								return (vote.user == user._id && vote.question == scope.activeQuestion._id);
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
						scope.activeQuestion.comments = _.union([response],scope.activeQuestion.comments);
					});
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

						scope.activeQuestion.recommendations = _.union(val, scope.activeQuestion.recommendations);
					})
				}

				scope.toggleRecommendSection = function(){
					$(".recommend-well").toggleClass("open");
				}

				scope.hideRecommendOption = function(followee){
					if(!scope.activeQuestion.recommendations){ return false; }
					var v = _.find(scope.activeQuestion.recommendations,function(v){ 
							return v.recommendee._id == followee; 
						});
					return (v?true:false);
				}

				scope.questionModal = function(question){
					if(!scope.disablePopup){
						scope.activeQuestion = {};
						scope.activeQuestion = question;

						var questionVotes = _.filter(scope.activeQuestion.votes,function(vote){ return _.isUndefined(vote.comment); });
						scope.activeQuestion.votesByUser =  _.groupBy(questionVotes,'user');
						scope.activeQuestion.currentAnswer = _.find(question.votes,function(vote){
							return vote.user == user._id && _.isUndefined(vote.comment);
						});
						scope.activeQuestion.userImagePath = '../../img/user/'+scope.activeQuestion.user.image+'-sml.png';

						$(".recommend-well").removeClass("open");
						var commentVotes = _.filter(scope.activeQuestion.votes,function(vote){ return !_.isUndefined(vote.comment); });
						var commentVoteGrouped = _.groupBy(commentVotes,'comment');
						scope.activeQuestion.commentScores = {};
						_.each(commentVoteGrouped, function(votes, key){
							scope.activeQuestion.commentScores[key] = _.reduce(votes,function(memo, vote){
								return memo + vote.answer;
							},0);
						});

						$("#viewQuestion"+scope.uniqueName).modal("show");
						$("#viewQuestion"+scope.uniqueName+" .buttons .btn").tooltip();
					}else{scope.disablePopup = false;}
				}

			}
		};
	}]
);