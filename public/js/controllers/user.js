'use strict';

angular.module('cueanda').controller('UserController',
	['$scope','$resource', '$routeParams', '$sce', '$fileUploader',
	function($scope,$resource,$routeParams, $sce, $fileUploader) {

		var User = $resource('user/:userName',
									{ userName: '@username' }, 
									{ update: { method: 'POST' } }
								);
        var Follow = $resource('follow/:followee',
                                    { followee: '@followee' }, 
                                    { update: { method: 'POST' } }
                                );

        $scope.currentUser = user;

        var setUploader = function(){
            
            var uploader = $scope.uploader = $fileUploader.create({
                scope: $scope,
                url: 'user/'+$scope.userProfile.username+'/img'
            });
            // ADDING FILTERS
            // Images only
            uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
                var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            });
            // REGISTER HANDLERS
            uploader.bind('afteraddingfile', function (event, item) {
                console.info('After adding a file', item);
            });

            uploader.bind('afteraddingall', function (event, items) {
                console.info('After adding all files', items);
            });

            uploader.bind('beforeupload', function (event, item) {
                console.info('Before upload', item);
            });

            uploader.bind('progress', function (event, item, progress) {
                console.info('Progress: ' + progress, item);
            });

            uploader.bind('success', function (event, xhr, item, response) {
                console.info('Success', xhr, item, response);
            });

            uploader.bind('cancel', function (event, xhr, item) {
                console.info('Cancel', xhr, item);
            });

            uploader.bind('error', function (event, xhr, item, response) {
                console.info('Error', xhr, item, response);
            });

            uploader.bind('complete', function (event, xhr, item, response) {
                console.info('Complete', xhr, item, response);
                uploader.clearQueue()
                $scope.userProfile.image = response.image;
                $(".form-group.profile-image img").remove();
                $(".form-group.profile-image").prepend("<img src='../../img/user/"+$scope.userProfile.image+"-sml.png' />")
            });

            uploader.bind('progressall', function (event, progress) {
                console.info('Total progress: ' + progress);
            });

            uploader.bind('completeall', function (event, items) {
                console.info('Complete all', items);
            });

        }


		User.get({
            userName: $routeParams.userName
        }, function(ruser) {
        	//console.log(user);
            $scope.userProfile = ruser;
            $scope.userUpdatePostUrl = "http://127.0.0.1:3000/user/"+$scope.userProfile.username;
            $scope.userUpdatePostUrl = $sce.trustAsResourceUrl($scope.userUpdatePostUrl);
            console.log($scope.userProfile.follows);
            var t = _.find($scope.userProfile.follows,function(follow){
                return follow.follower._id == user._id;
            });
            console.log(user);
            $scope.isFollowing = (t?true:false);
            setUploader();
        });

        $scope.toggleFollow = function(){
            console.log('got here');
            var flw = new Follow({followee:$scope.userProfile._id})

            if($scope.isFollowing){
                flw.$delete(function(response){
                    console.log('deleted follow!');
                    user.follows = _.reject(user.follows,function(f){
                        return f.followee._id == $scope.userProfile._id;
                    })
                    $scope.isFollowing = false;
                })
            }else{
                flw.$save(function(response){
                    console.log('created follow!');
                    $scope.userProfile.follows.push(response);
                    user.follows.push(response);
                     $scope.isFollowing = true;
                })
            }
        }

        $scope.updateUser  = function(){
        	/*$scope.userProfile.$update(function(response){
        		console.log('repsonse from user update:');
        		console.log(repsonse);
        	})*/
        }


	}]	
);
