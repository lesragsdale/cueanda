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

				var pHNMap = {OptionA:"Option A",OptionB:"Option B",Question:"Question",OptionC:"Option C",OptionD:"Option D"};
				scope.placeHolderName = pHNMap[scope.name];


				/********** MENTION.JS *************/
				$timeout(function(){
					//get users that user follows
					var mentionUsers = _.filter(user.follows,function(follow){ return follow.follower._id === user._id; });
					//turn the image field into an actual image url
					//remove username from name if it exists because it messes up mention.js
					mentionUsers = _.map( mentionUsers, function(f){ 
						f.followee.fakeName = f.followee.name.toLowerCase().replace(f.followee.username.toLowerCase(),'');
						return  f.followee.image.substr(-4) === '.jpg'? f.followee : _.assign(f.followee,  {image:f.followee.image+'-sml.jpg'}   );
					});
					$("#"+scope.unique+'-input-field').mention({
					    queryBy: ['fakeName','username'],
					    users: mentionUsers
					});	
				});
				/********** MENTION.JS *************/


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
	                scope.imageUploadPath = 'https://s3.amazonaws.com/cueanda/qstn/'+scope.fieldData.imageUpload[0]+'.jpg';
	                
	                scope.isLoading = false;
	            	scope.showUploadPreview = true;
	            });

			}
		};
	}]	
);