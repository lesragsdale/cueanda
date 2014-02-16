var databaseURI = "localhost:27017/mean-dev";
var _ = require('lodash');
var moment = require("moment");
var collections = ["questions","categories","votes","users","comments","communities","communityTypes"];
var db = require("mongojs").connect(databaseURI, collections);

var users = [
				{
					name: "Leslie Ragsdale",
					email: "lesIsMore@gmail.com",
					username: "lesIsMore",
					image:'lesIsMore'
				},
				{
					name: "Joe Becker",
					email: "joe@gmail.com",
					username: "joe",
					image:'joe'
				},
				{
					name: "Gboyega Adebayo",
					email: "gade@gmail.com",
					username: "gboyega",
					image:'gboyega'
				},
				{
					name: "Danaryes Targaryen",
					email: "dtar@gmail.com",
					username: "danaryes",
					image:'danaryes'
				},
				{
					name: "Your Brother",
					email: "yb@gmail.com",
					username: "yoBro",
					image:'yoBro'
				},
				{
					name: "Barrack Obama",
					email: "b_rock@gmail.com",
					username: "b_rock",
					image:"b_rock"
				},
				{
					name: "Kim Kardashian",
					email: "b_rock@gmail.com",
					username: "kimmie_kay",
					image:"kimmie_kay"
				}
];
users = _.map(users,function(d){ return	_.assign(d,{'provider':"automated"}); });
var rComments = ["Bruh,...where da hoes at though?","So I was going to go with the first option but then I thought, 'what would my Mom think if she saw me answer this question in such a way?'...so then of course I had to change my answer to the second option...haha...good move or nah? ","Dam this question sucks","lol, I like my answer","clearly those who did not agree with my answer have no idea what they're talking about","man...who comes up with this shit??","This question really doesnt even make sense","Yea i felt as if this one was obvious","HAHA...","WTF?","Oh really? I wonder how most girls answered this question?","You know, I really question anyone that didnt answer the question the way I did...","Epic options on this one","Pretty sure no one with a brain would choose the second option."]
var answers = ["Stripping fully nude in a group people that you have a lot of respect for and giving a presentation on your goals for the next 5 years.","a grenade","a booger wolf","buttsecks","lube","sex","head","cheese","burgers","anal","reading Harry Potter","an orgy","sex with a famous person","oral sex","watching a good movie","bubble bath","discover new dinosaur fossil","chill by the beach","hear a new album from you favorit artist","a good foot rub","[insert body part] - job","practice an instrument","brush up on your chinese","google for something random"]
var questions = ["Some of these questions have to serve a purpose, how about we test some shit?WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW","While this question may be long, I emplore you to do you best to answer with integrity...Hidden deep within the crevices of your extra secret, never-opened, but never forgotten drawer is a photo of you involved with...","Which option better completes a trio of fun things/activities? your ex girlfriend, your mom,  and .... ","Which option better completes a trio of fun things/activities? peanut-putter, ice-cream, and .... ","What would you rather do?","Which is worse?","What do you spend most of your time doing?","What do you do that you never tell your family about?","Fun hobby of yours?","What would you ask for if a genie granted you 3 wishes?","Its a cold and rainy day with nothing else better to do. (No work, no errands) Which of the following are you more likely to be caught doing? Be honest.."]
var categories = [ 
					{
						name: "Business & Finance",
						machine_name: "business_finance",
						type: 1
					},
					{
						name: "Entertainment",
						machine_name: "entertainment",
						type: 1
					},
					{
						name: "Food & Drink",
						machine_name: "food_drink",
						type: 1
					},
					{
						name: "Health & Fitness",
						machine_name: "health_fitness",
						type: 1
					},
					{
						name: "Just for Fun",
						machine_name: "just_fun",
						type: 1
					},
					{
						name: "Law & Justice",
						machine_name: "law_justice",
						type: 1
					},
					{
						name: "Misc",
						machine_name: "misc",
						type: 1
					},  
					{
						name: "Music",
						machine_name: "music",
						type: 1
					},  
					{
						name: "Politics",
						machine_name: "politics",
						type: 1
					},  
					{
						name: "Religion & Spirituality",
						machine_name: "religion_spirituality",
						type: 1
					},
					{
						name: "Sex & Relationships",
						machine_name: "sex_relationships",
						type: 1
					},  
					{
						name: "Sports",
						machine_name: "sports",
						type: 1
					},  
					{
						name: "Technology",
						machine_name: "technology",
						type: 1
					},  
					{
						name: "Travel",
						machine_name: "travel",
						type: 1
					},  
					{
						name: "Academics",
						machine_name: "academica",
						type: 2
					},  
					{
						name: "Athletics",
						machine_name: "athletics",
						type: 2
					},  
					{
						name: "Clubs & Organizations",
						machine_name: "clubs_organizations",
						type: 2
					},  
					{
						name: "Food & Drink",
						machine_name: "food_drink",
						type: 2
					},  
					{
						name: "Gossip",
						machine_name: "gossip",
						type: 2
					},  
					{
						name: "Greek Life",
						machine_name: "greek_life",
						type: 2
					},  
					{
						name: "Housing",
						machine_name: "housing",
						type: 2
					},  
					{
						name: "Misc",
						machine_name: "misc",
						type: 2
					},  
					{
						name: "Nightlife",
						machine_name: "nightlife",
						type: 2
					},
					{
						name: "Attractions",
						machine_name: "attractions",
						type: 3
					},  
					{
						name: "Business & Finance",
						machine_name: "business_finance",
						type: 3
					},  
					{
						name: "Entertainment",
						machine_name: "entertainment",
						type: 3
					},  
					{
						name: "Food & Drink",
						machine_name: "food_drink",
						type: 3
					},  
					{
						name: "Health & Fitness",
						machine_name: "health_fitness",
						type: 3
					},  
					{
						name: "Misc.",
						machine_name: "misc",
						type: 3
					},  
					{
						name: "News & Politics",
						machine_name: "news_politics",
						type: 3
					},  
					{
						name: "Nightlife",
						machine_name: "nightlife",
						type: 3
					},  
					{
						name: "Real Estate",
						machine_name: "real_estate",
						type: 3
					},  
					{
						name: "Sports",
						machine_name: "sports",
						type: 3
					},
					{
						name: "Draft Central",
						machine_name: "draft_central",
						type: 4
					},  
					{
						name: "Drop or Keep",
						machine_name: "drop_keep",
						type: 4
					},  
					{
						name: "Head to Head",
						machine_name: "head_head",
						type: 4
					},  
					{
						name: "Misc",
						machine_name: "misc",
						type: 4
					},  
					{
						name: "Start or Sit",
						machine_name: "start_sit",
						type: 4
					}
				];
var communityTypes = [ 
	{
		name: "College & Universities",
		num: 2
	},
	{ 
		name: "Cities",
		num: 3
	},
	{
		name: "Fantasy Sports",
		num:4
	}];
var communities = [
	{
		name:"James Madison University",
		path:"james_madison",
		type:2
	},
	{
		name:"Penn State University",
		path:"penn_state",
		type:2
	},
	{
		name:"University of Maryland",
		path:"maryland",
		type:2
	},
	{
		name:"University of Virginia",
		path:"virginia",
		type:2
	},
	{
		name:"Virginia Tech",
		path:"virgina_tech",
		type:2
	},
	{
		name:"Baltimore, MD",
		path:"baltimore",
		type:3
	},
	{
		name:"Chicago, IL",
		path:"chicago",
		type:3
	},
	{
		name:"New York, NY",
		path:"new_york",
		type:3
	},
	{
		name:"Richmond, VA",
		path:"richmond",
		type:3
	},
	{
		name:"Washington DC",
		path:"washington_dc",
		type:3
	},
	{
		name:"Fantasy Basketball",
		path:"basketball",
		type:4
	},
	{
		name:"Fantasy Football",
		path:"football",
		type:4
	}
]

var getSomeComments = function(){
	var comments = []
	_.times(_.random(1,10),function(n){
		comments.push(
						{
							user: users[_.random( _.size(users)-1 )],
							created: moment().valueOf() - _.random(100000),
							body: rComments[_.random( _.size(rComments)-1 )]
						}
			);
	})
	return comments
}

//Drop Communities
db.communities.remove({},function(err,lastErrorObject){
});	
//Drop Community Types
db.communityTypes.remove({},function(err,lastErrorObject){
});	
//Drop Comments
db.comments.remove({},function(err,lastErrorObject){
});			
//Drop Fake Users
db.users.remove({provider:"automated"},function(err,lastErrorObject){
});
//Drop Questions
db.questions.remove({},function(err,lastErrorObject){
});
//Drop Categories
db.categories.remove({},function(err,lastErrorObject){
});
//Drop All Votes
db.votes.remove({},function(err,lastErrorObject){

	db.communityTypes.insert(communityTypes,function(err,mngCmTp){
		//console.log('');
	})

	db.communities.insert(communities,function(err,mngCommunities){

		db.categories.insert(categories, function(err, mngCats) {

			db.users.insert(users, function(err, mngUsrs) {
				var newQuestions = [];
				var catsByType = _.groupBy(mngCats,'type')
				//var comByType = _.groupBy(mngCommunities,'type')

				_.times(70,function(n){
					//console.log(n);

					var aQue = {
								title: questions[_.random( _.size(questions)-1 )],
								created: moment().valueOf() - _.random(100000),
								answers:[
											{title: answers[_.random( _.size(answers)-1 )] },
											{title: answers[_.random( _.size(answers)-1 )] }
										],
								category: catsByType[1][_.random( _.size(catsByType[1])-1 )]._id,
								user: mngUsrs[_.random( _.size(mngUsrs)-1 )]._id
							}
					if(_.random(10) > 5){
						var theComm = mngCommunities[_.random( _.size(mngCommunities)-1 )]
						var theCats = catsByType[theComm.type]
						aQue.community = theComm._id
						aQue.category = theCats[_.random( _.size(theCats)-1 )]._id
					}

					newQuestions.push(aQue);
				});

				db.questions.insert(newQuestions, function(err, mngQuestions) {
					
					var newVotes = [];

					_.each(mngQuestions, function(mngQ){
						_.each(mngUsrs,function(mngU){
							newVotes.push({
								question: mngQ._id,
								user: mngU._id,
								answer: _.random(0,1)
							});
						})
					})


					db.votes.insert(newVotes, function(err, mngVotes) {

						var newComments = [];

						_.each(mngQuestions,function(quest){
							_.times(_.random(1,10),function(d){
								newComments.push(
											{
												user: mngUsrs[_.random( _.size(mngUsrs)-1 )]._id,
												question: quest._id,
												created: moment().valueOf() - _.random(100000),
												body: rComments[_.random( _.size(rComments)-1 )]
											}
									);
							})
						})

						db.comments.insert(newComments, function(err, mngComments) {
							
							process.exit(1);
						});
					});
				});

			});
		});
	});

});