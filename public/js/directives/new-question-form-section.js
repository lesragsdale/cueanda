'use strict';

angular.module('cueanda').directive('newQuestionFormSection',[ '$resource', '$timeout','$fileUploader',
	function($resource, $timeout, $fileUploader) {
		return {
			scope: {
				fieldData: "=",
				name: "@",
				unique: "@"
			},
			restrict: 'E',
			replace: true,
			templateUrl: 'views/question/new-question-form-section.html',
			link: function(scope, element, attrs) {

				scope.isLoading = false;
				scope.showPreview = false;
				scope.showUploadPreview = false;

				$("button.has-tooltip").tooltip({
				     'delay': { show: 1000, hide: 0 }
				});

				scope.embedValChanged = function(){
					scope.showPreview = false;
					scope.isLoading = true;
					var mh = (scope.unique == 'rq'?300:250);
					$.embedly.oembed(scope.fieldData.embedInput, {query: {}, key: '6890daa4400511e1adbd4040d3dc5c07' })
				    .progress(function(obj){
				      $timeout(function(){
					      scope.fieldData.showLink = true;
					      scope.fieldData.embed = obj;
					      scope.isLoading = false;
					      scope.showPreview = true;
					  },0);
				    });
				}

				var uploader = scope.uploader = $fileUploader.create({
	                scope: scope,
	                url: 'pic'
	            });

	            uploader.bind('afteraddingfile', function (event, item) {
	            	scope.isLoading = true;
	            	scope.showUploadPreview = false;
	                //console.info('After adding a file', item);
	                item.upload();
	            });

	            uploader.bind('complete', function (event, xhr, item, response) {
	                //console.info('Complete', xhr, item, response);
	                uploader.clearQueue();
	                //console.log(response._id);
	                if(scope.fieldData.imageUpload){
	                	scope.fieldData.imageUpload.push(response._id);
	                }else{
	                	scope.fieldData.imageUpload = [response._id];
	                }
	                scope.imageUploadPath = './../img/qstn/'+scope.fieldData.imageUpload[0]+'.png';
	                
	                scope.isLoading = false;
	            	scope.showUploadPreview = true;
	            });

			}
		};
	}]	
);