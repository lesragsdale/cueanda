'use strict';

angular.module('cueanda').directive('votingBar',
	function() {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, element, attrs) {

				scope.$watch(attrs.question, function(value) {
					scope.question = scope.$eval(attrs.question);
					//if(!_.isUndefined(scope.votes)){
						buildBar((scope.question?scope.question:{}));
					//}
				});

				var buildBar = function(question){
					var qVotes = _.filter(question.votes,function(vote){ return _.isUndefined(vote.comment); } )
					var counts = _.countBy(qVotes,function(vote){return vote.answer;});
					var vCount = _.size(qVotes);
					var answers = question.answers || [];
					var htmlOutput = ""

					if(answers.length > 0){
						htmlOutput += "<div class='vote-bar "+(vCount == 0?'is-empty':'')+" '>";

						_.each(counts,function(val,key){
							htmlOutput += "<div class='vote-sec vote-sec-"+key+"'' style='width:"+((val/vCount)*100)+"%' perc='"+((val/vCount)*100).toFixed(0)+"' votes='"+val+"' answer='"+answers[key].mainInput+"'></div>";
						});

						htmlOutput += "</div>";
					}

					//Percentages
					if(_.isUndefined(counts[0])){ counts[0] = 0; }
					if(_.isUndefined(counts[1])){ counts[1] = 0; }

					if(answers.length > 0){
						htmlOutput += "<div style='text-align:center' class='vote-numbers'> <span class='badge'>"+vCount+" vote"+(vCount != 1?'s':'')+"</span>";
						/*_.each(counts,function(val,key){
							htmlOutput += "<span class='badge  "+(vCount == 0?'hidden':'')+"  "+(key==0?'pull-left':'pull-right')+" '>"+((val/vCount)*100).toFixed(0)+"%</span>";
						});*/
						htmlOutput += "</div>";
					}else{
						var cCount = _.size(question.comments)
						htmlOutput += "<div style='text-align:center' class='vote-numbers'> <span class='badge'>"+cCount+" comment"+(cCount != 1?'s':'')+"</span></div>"
					}
					

					$(element).html(htmlOutput);
				}

			}
		};
	}	
);