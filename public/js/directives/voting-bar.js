'use strict';

angular.module('cueanda').directive('votingBar',
	function() {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, element, attrs) {

				scope.$watch(attrs.votes, function(value) {
					scope.votes = scope.$eval(attrs.votes);
					if(!_.isUndefined(scope.votes)){
						buildBar(scope.votes);
					}
				});

				var buildBar = function(votes){
					var qVotes = _.filter(votes,function(vote){ return _.isUndefined(vote.comment); } )
					var counts = _.countBy(qVotes,function(vote){return vote.answer;});
					var vCount = _.size(qVotes);

					var htmlOutput = "<div class='vote-bar'>";

					_.each(counts,function(val,key){
						htmlOutput += "<div class='vote-sec vote-sec-"+key+"'' style='width:"+((val/vCount)*100)+"%'></div>";
					});

					htmlOutput += "</div>";

					$(element).html(htmlOutput);
				}

			}
		};
	}	
);