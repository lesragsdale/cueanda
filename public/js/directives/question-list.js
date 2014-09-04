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
					"fashion":"fa fa-shopping-cart",
					"start_sit":"glyphicon glyphicon-random"
				};

			    scope.isQuestionRecommended = function(question){
			    	if(!question.recommendations){ return false; }
			    	if(_.isUndefined(user)){ return false; }

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


						//CODE REPEATED IN singleQuestion.js
						var questionVotes = _.filter(scope.activeQuestion.votes,function(vote){ return _.isUndefined(vote.comment); });
						scope.activeQuestion.votesByUser =  _.groupBy(questionVotes,'user');
						scope.activeQuestion.currentAnswer = _.find(question.votes,function(vote){
							return compareUserAnswer(vote) && _.isUndefined(vote.comment);
						});
						scope.activeQuestion.userImagePath = scope.activeQuestion.user.image+'-sml.jpg';

						$(".recommend-well").removeClass("open");
						var commentVotes = _.filter(scope.activeQuestion.votes,function(vote){ return !_.isUndefined(vote.comment); });
						var commentVoteGrouped = _.groupBy(commentVotes,'comment');

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
						//END OF CODE REPEATED IN singleQuestion.js

						$("#viewQuestion"+scope.uniqueName).modal("show");
						$("#viewQuestion"+scope.uniqueName+" .buttons .btn").tooltip();
					}else{scope.disablePopup = false;}
				}


			}
		};
	}]
);