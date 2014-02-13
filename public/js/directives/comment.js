'use strict';

angular.module('cueanda').directive('comment',
	function() {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, element, attrs) {

				scope.$watch(attrs.comments, function(value) {
					scope.comments = scope.$eval(attrs.comments);
					scope.votes = scope.$eval(attrs.votes);
					buildComments(scope.comments, scope.votes);
				});

				scope.$watch(attrs.votes, function(value) {
					scope.comments = scope.$eval(attrs.comments);
					scope.votes = scope.$eval(attrs.votes);
					buildComments(scope.comments, scope.votes);
				});

				var buildComments = function(comments, votes){
					var userVotes = _.groupBy(votes,function(vote){return vote.user;});
					var htmlOutput = "<div class='comments'>";

					_.each(comments,function(comment){
						
						var usrVote = userVotes[comment.user._id][0].answer;

						htmlOutput += "<div class='comment comment-"+usrVote+"' >";

							var cmtImage = "<div class='comment-img'><img src='../../img/user/"+comment.user.username+"-sml.png'></div>";
							
							var cmtMiddle = "<div class='comment-main'>";
							cmtMiddle += 	"<div class='title'><span class='name'>"+comment.user.username+"</span>"+comment.created+"</div>";
							cmtMiddle += 	"<div class='body'>"+comment.body+"</div>";
							cmtMiddle += "</div>";

							var cmtVote = "<div class='comment-vote'><div class='btn-group-vertical'>";
							cmtVote +=	"<button class='btn btn-sm vote-butt-up'><span class='fa fa-thumbs-o-up'></span></button>";
							cmtVote +=	"<button class='btn btn-sm vote-score'>28</button>";
							cmtVote +=	"<button class='btn btn-sm vote-butt-down'><span class='fa fa-thumbs-o-down'></span></button>";
							cmtVote +="</div></div>";

							if(usrVote){
								htmlOutput += cmtImage + cmtMiddle + cmtVote;
							}else{
								htmlOutput += cmtVote + cmtMiddle + cmtImage;
							}

						htmlOutput += "</div>";
					});

					htmlOutput += "</div>";

					$(element).html(htmlOutput);
				}

			}
		};
	}	
);