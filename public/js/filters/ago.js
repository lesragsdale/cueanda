angular.module('cueanda').filter('ago', function() {
	return function(input) {
		return moment(input).fromNow();
	};
});
