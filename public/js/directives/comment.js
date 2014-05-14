'use strict';

angular.module('cueanda').directive('comment',[ '$resource', '$timeout', '$filter', '$sce', '$location',
	function($resource, $timeout, $filter, $sce, $location) {
		return {
			/*scope: {
				question: "=",
				uniqueName: "=",
				commentToDelete: "="
			},*/
			restrict: 'E',
			replace: true,
			templateUrl: 'views/question/comment.html',
			link: function(scope, element, attrs) {
				scope.currentUser = user;

				var Vote = $resource('vote/:questionId/:commentId/:answerOption',
									{ questionId: '@question', commentId: '@comment', answerOption: '@answer' }, 
									{ update: { method: 'PUT' } }
								);

				var Comment = $resource(	'comment/:commentId',
											{ commentId: '@comment'}, 
											{ update: { method: 'PUT' } }
										);

				scope.$watch(attrs.question, function(value) {
					scope.question = scope.$eval(attrs.question);
					if(scope.question){
						scope.question.comments = _.map(scope.question.comments,function(comment){
							var safeHtml = $sce.trustAsHtml($filter('mentionLinks')(comment.body));
							return _.assign(comment,{ body: safeHtml });
						});
						$timeout(function(){
							$(".mention-link").on('click',function(event){
								$('.modal').modal('hide');
								var elmId = $(this).attr("id");
								scope.disablePopup = true;
								$timeout(function(){
									window.location = "#!/user/"+elmId;
								},500);								
								//$location.path('user/'+$(this).attr("id"));
							});
						},100);
						
					}
				});

				scope.hideAllModals = function(){
					$('.modal').modal('hide');
				}				

				scope.sortByPop = true;
				scope.sortBy = function(comment){
					return (scope.sortByPop?comment.score:comment.created);
				};

				scope.changeSort = function(val){
					scope.sortByPop = val;
				}

				scope.goToUser = function(username){
			    	$('.modal').modal('hide');
			    	$timeout(function(){
			    		window.location = "#!/user/"+username;
			    	},500);
			    }

			    scope.toggleModal = function(id){
			    	console.log('#'+id+scope.uniqueName);
					$('#'+id+scope.uniqueName).modal('toggle');
				}

			    scope.prepareToDeleteComment = function(commentId){
					scope.commentToDelete = commentId;
					scope.toggleModal('deleteComment');
				}				

				scope.castCommentVote = function(comment, option){
					/*** EXIT IF ANSWER IS NOT NEW ***/
					var oldAnswerExists = false;
		
					var currentAnswerToComment = _.find(scope.question.votes,function(vote){
						return vote.comment == comment && vote.user == user._id;
					})
					if(!_.isUndefined(currentAnswerToComment)){
						oldAnswerExists = true;
						if(currentAnswerToComment.answer == option){
							console.log('already gave this comment that answer!');
							return;
						}
					}

					/*** PERSIST ANSWER ***/
					var aCmtVote = new Vote({
						question: scope.question._id,
						comment: comment,
						answer:option
					});
					aCmtVote.$save(function(response){
						if(oldAnswerExists){
							//console.log('try to delete old vote. current vote size: '+_.size(scope.question.votes))
							scope.question.votes = _.reject( scope.question.votes, function(vote){
								return (vote.user == user._id && vote.comment == comment);
							} );
							//console.log('size after: '+_.size(scope.question.votes))
						}
						//console.log('result of vote save:')
						//console.log(response);				
						scope.question.votes = _.union([response],scope.question.votes);	

						//Update comment Scores
						var commentVotes = _.filter(scope.question.votes,function(vote){ return !_.isUndefined(vote.comment); });
						var commentVoteGrouped = _.groupBy(commentVotes,'comment');

						scope.question.comments = _.map(scope.question.comments,function(comment){
							if( _.isUndefined(commentVoteGrouped[comment._id]) ){
								comment.score = 0;
							}else{	
								comment.score = _.reduce(commentVoteGrouped[comment._id],function(memo, vote){
									return memo + vote.answer;
								},0);
							}
							return comment;							
						});


					});

				}
			}
		};
	}]	
);