'use strict';

angular.module('cueanda').directive('votingBar',
	function() {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, element, attrs) {

				scope.$watch(attrs.votes, function(value) {
					scope.votes = scope.$eval(attrs.votes);
					//if(!_.isUndefined(scope.votes)){
						buildBar((scope.votes?scope.votes:[]));
					//}
				});

				var buildBar = function(votes){
					var qVotes = _.filter(votes,function(vote){ return _.isUndefined(vote.comment); } )
					var counts = _.countBy(qVotes,function(vote){return vote.answer;});
					var vCount = _.size(qVotes);

					var htmlOutput = "<div class='vote-bar "+(vCount == 0?'is-empty':'')+" '>";

					_.each(counts,function(val,key){
						htmlOutput += "<div class='vote-sec vote-sec-"+key+"'' style='width:"+((val/vCount)*100)+"%'></div>";
					});

					htmlOutput += "</div>";

					//Percentages
					if(_.isUndefined(counts[0])){ counts[0] = 0; }
					if(_.isUndefined(counts[1])){ counts[1] = 0; }

					htmlOutput += "<div style='text-align:center' class='vote-numbers'> <span class='badge'>"+vCount+" vote"+(vCount != 1?'s':'')+"</span>";
					_.each(counts,function(val,key){
						htmlOutput += "<span class='badge  "+(vCount == 0?'hidden':'')+"  "+(key==0?'pull-left':'pull-right')+" '>"+((val/vCount)*100).toFixed(0)+"%</span>";
					});
					htmlOutput += "</div>";

					$(element).html(htmlOutput);
				}

			}
		};
	}	
);