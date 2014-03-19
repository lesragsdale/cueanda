'use strict';

angular.module('cueanda').controller('StreamController',
	['$scope','$resource', '$routeParams', '$timeout', '$http',
	function($scope, $resource, $routeParams, $timeout, $http) {
		$scope.questionVariable = "Poo man it works!";
		$scope.questionFilter = 'all';
		$scope.categoryFilter = [];
		$scope.mobileCategory = false;
		$scope.currentUser = user;

		var Question = $resource(	'questions/:communityId',
									{ 'communityId': '@community' }, 
									{ update: { method: 'PUT' }}
								);

		var Category = $resource(	'category/:type',
									{ type: '@type' }, 
									{ update: { method: 'PUT' } }
								);

		var Community = $resource(	'community/byName/:communityName',
									{ communityName: '@community' }, 
									{ update: { method: 'PUT' } }
								);

		$scope.catIcons = {
					"business_finance": "fa fa-money",
					"entertainment": "fa fa-ticket",
					"food_drink": "glyphicon glyphicon-cutlery",
					"health_fitness": "fa fa-medkit",
					"just_fun": "fa fa-smile-o",
					"law_justice":"fa fa-gavel",
					"misc":"fa fa-cogs",
					"music":"fa fa-music",
					"politics":"fa fa-dashboard",
					"religion_spirituality":"glyphicon glyphicon-bell",
					"sex_relationships":"glyphicon glyphicon-heart",
					"sports":"fa fa-trophy",
					"technology":"fa fa-rocket",
					"travel":"fa fa-map-marker",
					"academica":"glyphicon glyphicon-book",
					"athletics":"glyphicon glyphicon-road",
					"clubs_organizations":"glyphicon glyphicon-map-marker",
					"gossip":"glyphicon glyphicon-comment",
					"greek_life":"glyphicon glyphicon-font",
					"housing":"glyphicon glyphicon-home",
					"attractions":"glyphicon glyphicon-star",
					"news_politics":"glyphicon glyphicon-print",
					"nightlife":"glyphicon glyphicon-glass",
					"real_estate":"glyphicon glyphicon-globe",
					"draft_central":"glyphicon glyphicon-tasks",
					"drop_keep":"glyphicon glyphicon-trash",
					"head_head":"glyphicon glyphicon-retweet",
					"start_sit":"glyphicon glyphicon-random"
				};

		$scope.selectCategory = function(cat){
			console.log(cat);
			cat.active = !(cat.active);
			$scope.refreshQuestionList();
		}

		$scope.refreshQuestionList = function(fromMobile){

			
			var cats = [];

			if(fromMobile){			
				cats = $scope.categoryFilter;
			}else{
				cats = _.filter($scope.categories,function(cat){
					return cat.active == true;
				});
				cats = _.map(cats,function(cat){
					return cat._id;
				});
			}

			var qst = {}
			if($scope.questionFilter != 'all'){ qst[$scope.questionFilter] = true; }
			if(!_.isEmpty(cats)){ qst.categories = cats; }
			if($routeParams.communityId){ qst.community = $routeParams.communityId; }

			//var Q = new Question(qst);

			Question.query(qst,function(questions){
				console.log(questions);
				$scope.questions = questions;
			})


		}

	    $scope.pullQuestions = function() {

	    	if($routeParams.communityId){
	    		Community.get({communityName: $routeParams.communityId},function(community){
	    			loadQuestions({communityId: community._id},{type: community.type});
	    		})
	    	}else{
	    		loadQuestions({},{type: 1});
	    	}
	    }

	    var loadQuestions = function(qCriteria, cCriteria){

	    	Question.query( qCriteria ,function(questions) {
	            $scope.questions = questions;
	        });

	        Category.query( cCriteria ,function(categories) {
	            $scope.categories = categories;
	        });
	    }

		$scope.createQuestion = function() {
			var question = {
				question: $scope.newQuestion.question,
				answers: [
							$scope.newQuestion.optionA,
							$scope.newQuestion.optionB
						],
				category: $scope.newQuestion.category,
				isPrivate: ($scope.newQuestion.private == 'true'?true:false),
				privateList: $scope.newQuestion.privateList
			};

			if($routeParams.communityId){ question.community = $routeParams.communityId;	}

			//var resQ = new Question(question);

			$http.post('questions/',question).success(function(response){
				$("#questionModal").modal('hide');

				var rndResponses = [
					"Cool Question Bro!",
					"Nice, you made a question...good job!",
					"Is that the best question you've got? ... alright, we'll take it",
					"Hah, nice question",
					"Good luck finding someone to answer that one..",
					"Your question has been submitted"
				];

				$scope.questions.push(response[0]);

				alertify.log(rndResponses[_.random(_.size(rndResponses)-1)], 'standard', 4000);
			});

		};

	}]	
);
