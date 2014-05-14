'use strict';

angular.module('cueanda').controller('UserController',
	['$scope','$resource', '$routeParams', '$sce', '$fileUploader', '$filter',
	function($scope,$resource,$routeParams, $sce, $fileUploader, $filter) {

		var User = $resource('user/:userName',
									{ userName: '@username' }, 
									{ update: { method: 'POST' } }
								);
        var Follow = $resource('follow/:followee',
                                    { followee: '@followee' }, 
                                    { update: { method: 'POST' } }
                                );
        var Question = $resource('questions',
                                    { }, 
                                    { update: { method: 'POST' } }
                                );

        $scope.currentUser = user;

        $scope.$watch($routeParams.query,function(value){
            //console.log($routeParams);
            if($routeParams.clearModal){
                $(".modal").modal("hide");
            }
            $('.modal').modal('hide');
        });

        var makeHtmlContentSafe = function(q){
            q.question.mainInput = $sce.trustAsHtml($filter('mentionLinks')(q.question.mainInput));
            q.answers = _.map(q.answers,function(answer){
                return _.assign(answer, {mainInput:  $sce.trustAsHtml($filter('mentionLinks')(answer.mainInput))  });
            });
            return q;
        }

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
                $(".form-group.profile-image").prepend("<img class='user-image-display' src='"+$scope.userProfile.image+"-sml.jpg' />")
            });

            uploader.bind('progressall', function (event, progress) {
                console.info('Total progress: ' + progress);
            });

            uploader.bind('completeall', function (event, items) {
                console.info('Complete all', items);
            });

        }


        $scope.loadUserData =function(){
            User.get({
                userName: $routeParams.userName
            }, function(ruser) {
                console.log(ruser);
                $scope.userProfile = ruser;
                $scope.userUpdatePostUrl = "http://127.0.0.1:3000/user/"+$scope.userProfile.username;
                $scope.userUpdatePostUrl = $sce.trustAsResourceUrl($scope.userUpdatePostUrl);
                $scope.userLargeImagePath = $scope.userProfile.image+"-lrg.jpg";
                var t = undefined;
                if(user){
                    t = _.find($scope.userProfile.follows,function(follow){
                        return follow.follower._id == user._id;
                    });
                }
                $scope.isFollowing = (t?true:false);
                loadUserQuestions()
                setUploader();
            });
        }

        var loadUserQuestions = function(){
            Question.query({ userAsked: $scope.userProfile._id },function(response){
                response = _.map(response,function(qst){ return makeHtmlContentSafe(qst); });
                $scope.askedQuestions = response
            });

            Question.query({ userVoted: $scope.userProfile._id },function(response){
                response = _.map(response,function(qst){ return makeHtmlContentSafe(qst); });
                $scope.votedQuestions = response
            });

            Question.query({ userMentioned: $scope.userProfile._id },function(response){
                response = _.map(response,function(qst){ return makeHtmlContentSafe(qst); });
                $scope.mentionedQuestions = response
            });
        }

        $scope.toggleFollow = function(){
            var flw = new Follow({followee:$scope.userProfile._id})

            if($scope.isFollowing){
                flw.$delete(function(response){
                    console.log('deleted follow!');
                    user.follows = _.reject(user.follows,function(f){
                        return f.followee._id == $scope.userProfile._id;
                    });
                    $scope.userProfile.follows = _.reject($scope.userProfile.follows,function(f){
                        return f.follower._id == user._id;
                    });
                    $scope.isFollowing = false;
                    alertify.log("Un-Followed "+$scope.userProfile.username+"", 'standard', 4000);
                })
            }else{
                flw.$save(function(response){
                    console.log('created follow!');
                    console.log(response);
                    $scope.userProfile.follows.push(response);
                    user.follows.push(response);
                    $scope.isFollowing = true;
                    alertify.log("Following "+$scope.userProfile.username+"!", 'standard', 4000);
                })
            }
        }

        $scope.updateUser  = function(){
        	$scope.userProfile.$update(function(response){
        		console.log('repsonse from user update:');
        		console.log(response);
        	})
        }


	}]	
);
