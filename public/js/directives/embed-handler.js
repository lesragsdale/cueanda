'use strict';

angular.module('cueanda').directive('embedHandler', ['$sce',
	function($sce) {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'views/question/embed-handler.html',
			link: function(scope, element, attrs) {
				scope.$watch(attrs.data, function(value) {
					scope.data = scope.$eval(attrs.data)
					if(scope.data){
						if(scope.data.embed && scope.data.embed.type == 'video'){
							scope.safeHtmlEmbed = $sce.trustAsHtml(scope.data.embed.html);
						}
						if(scope.data.showLink == false){
							scope.uploadPath = 'https://s3.amazonaws.com/cueanda/qstn/'+scope.data.imageUpload[0]+'.jpg';
						}
					}
					
				});
			}
		};
	}]	
);