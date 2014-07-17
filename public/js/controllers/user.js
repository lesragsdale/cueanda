'use strict';

angular.module('cueanda').controller('UserController',
	['$scope','$resource', '$routeParams', '$sce', '$fileUploader', '$filter', '$q', '$timeout', '$http', '$location',
	function($scope,$resource,$routeParams, $sce, $fileUploader, $filter, $q, $timeout, $http, $location) {

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

        var imageError = false;

        $scope.setUploader = function(){
            
            var uploader = $scope.uploader = $fileUploader.create({
                scope: $scope,
                url: 'user/'+$scope.userProfile.username+'/img'
            });
            // ADDING FILTERS
            // Images only
            uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
                var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
                if('|jpg|png|jpeg|bmp|'.indexOf(type) === -1 && !imageError){
                    imageError = true;
                    alertify.error("Image must be of type jpg, png, jpeg, or bmp.", 'standard', 4000);
                    $timeout(function(){ imageError = false; },1000);
                };
                return '|jpg|png|jpeg|bmp|'.indexOf(type) !== -1;
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

        $scope.goToUser = function(name){
            $location.path('user/'+name);
        };

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
                $scope.setUploader();
            });
        }

        var loadUserQuestions = function(){
            var aqp = Question.query({ userAsked: $scope.userProfile._id },function(response){
                response = _.map(response,function(qst){ return makeHtmlContentSafe(qst); });
                $scope.askedQuestions = response
            }).$promise;

            var vqp = Question.query({ userVoted: $scope.userProfile._id },function(response){
                response = _.map(response,function(qst){ return makeHtmlContentSafe(qst); });
                $scope.votedQuestions = response
            }).$promise;

            var mqp = Question.query({ userMentioned: $scope.userProfile._id },function(response){
                response = _.map(response,function(qst){ return makeHtmlContentSafe(qst); });
                $scope.mentionedQuestions = response
            }).$promise;

            $q.all([aqp,vqp,mqp]).then(function(){
                $timeout(function(){
                    $scope.$broadcast('enableMentionLinkFunc');
                },100);
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

        $scope.comparePass = function(){
            if( $scope.manage.newPass === "" && $scope.manage.newPassConfirm === "" ){
                $scope.managePassAlert = undefined;
                return;
            }

            $("#manage-pass-alert").removeClass('alert-success');
            $("#manage-pass-alert").removeClass('alert-danger');
            if($scope.manage.newPass === $scope.manage.newPassConfirm){
                $scope.managePassAlert = 'Match!';
                $("#manage-pass-alert").addClass('alert-success');
            }else{
                $scope.managePassAlert = 'Passwords must match!';
                $("#manage-pass-alert").addClass('alert-danger');
            }
            if( $scope.manage.newPass.length < 8 ){
                $scope.managePassAlert = 'Passwords must be at least 8 characters';
                $("#manage-pass-alert").addClass('alert-danger');
            }
        }

        $scope.updateUserPassword = function(){
            if( $scope.managePassAlert !== 'Match!' ){ $scope.updatePassError="You must provide a valid new password and confirm it."; return; }
            if( _.isUndefined($scope.manage.currentPass) || $scope.manage.currentPass === "" ){ $scope.updatePassError="You must provide your current password"; return;  }

            $http.post('user/'+$scope.userProfile.username, _.assign($scope.userProfile,{password:$scope.manage.newPass, currentPass:$scope.manage.currentPass}) )
            .success(function(){  
                $scope.manage = undefined;
                alertify.log("Password updated!", 'standard', 4000);
            })
            .error(function(){
                alertify.error("An error occurred when attempting to update your password!", 'standard', 4000);
            });

        } 

        $scope.updateUser  = function(){
            $scope.userProfile.$update(function(response){
        		alertify.log("User updated!", 'standard', 4000);
        	})
        }


	}]	
);
