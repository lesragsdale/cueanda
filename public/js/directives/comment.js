'use strict';

angular.module('cueanda').directive('comment',[ '$resource',
	function($resource) {
		return {
			scope: {
				question: "="
			},
			restrict: 'E',
			replace: true,
			templateUrl: 'views/question/comment.html',
			link: function(scope, element, attrs) {

				var Vote = $resource('vote/:questionId/:commentId/:answerOption',
									{ questionId: '@question', commentId: '@comment', answerOption: '@answer' }, 
									{ update: { method: 'PUT' } }
								);

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
						_.each(commentVoteGrouped, function(votes, key){
							scope.question.commentScores[key] = _.reduce(votes,function(memo, vote){
								return memo + vote.answer;
							},0);
						})


					});

				}
			}
		};
	}]	
);