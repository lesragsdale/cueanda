angular.module('cueanda').filter('pager', function() {
	return function(input, pagerObject) {
		if(_.isUndefined(input) || !pagerObject.pager){return input;}
		var size = input.length;
		var start = pagerObject.limit*pagerObject.page
		return input.slice(start,start+pagerObject.limit);
	};
});
