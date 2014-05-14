angular.module('cueanda').filter('mentionLinks', function() {
	return function(input) {

		var calcEnd = function(text, start){

			var cmpFnc = function (a, b) {
			  if (a < b){ return -1; }
			  if (a > b){  return 1; }
			  return 0;
			};

			var at = (text.substring(start+1).indexOf('@') !== -1 ? text.substring(start+1).indexOf('@')+1 : false);
			var lookFor = [' ','?','.','!',','];
			lookFor = _.map(lookFor,function(charac){
				var dex = text.substring(start).indexOf(charac);
				return (dex === -1?false:dex);
			});
			lookFor = _.compact(_.union([at],lookFor));
			if(_.isEmpty(lookFor)){ return text.length; }
			else{
					lookFor.sort(cmpFnc);
					var dex = lookFor[0];
			}

			return dex+start;
		};

		var currentSpot = 0;
		var output = '';
		while( input.substring(currentSpot).indexOf('@') > -1){
			var pInput = input.substring(currentSpot);
			//console.log(pInput);
			var start = pInput.indexOf('@');
			//console.log(start);
			var end = calcEnd(pInput,start)
			//console.log(end);
			output += pInput.substring(0,start) + "<span class='mention-link' id='"+pInput.substring(start+1,end)+"' poo='#!/user/"+pInput.substring(start+1,end)+"?clearModal=true;'>"+pInput.substring(start,end)+"</span>";
			//console.log(output);
			currentSpot += end;
			//console.log(currentSpot);
		}
		output += input.substring(currentSpot);

		return output;
	};
});

//this is @poo and ex @bobby pooo 