angular.module('cueanda').filter('ceil', function() {
	return function(input) {
		return Math.ceil(input)
	};
});
