angular.module('cueanda').filter('mentionLinks', function() {
	return function(input) {

		var calcEnd = function(text, start){
			var at = (text.substring(start+1).indexOf('@') !== -1 ? text.substring(start+1).indexOf('@')+1 : -1);
			var space = text.substring(start).indexOf(' ');
			var dex = -1;
			if( at === -1 && space === -1){ return text.length; }
			if( at === -1 || space === -1){ dex = (space > at ? space : at); }
			else{ dex = (space < at ? space : at);  }
			//console.log('dex: '+dex);
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
			output += pInput.substring(0,start) + "<span style='color:blue' class='mention-link' id='"+pInput.substring(start+1,end)+"' poo='#!/user/"+pInput.substring(start+1,end)+"?clearModal=true;'>"+pInput.substring(start,end)+"</span>";
			//console.log(output);
			currentSpot += end;
			//console.log(currentSpot);
		}
		output += input.substring(currentSpot);

		return output;
	};
});

//this is @poo and ex @bobby pooo 