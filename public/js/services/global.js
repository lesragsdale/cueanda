'use strict';

//Global service for global variables
angular.module('cueanda.system').factory('Global', ['$resource',
    function($resource) {
        var _this = this;
        _this._data = {
            user: window.user,
            authenticated: !! window.user
        };

        //Add Follows to global User object...
        if(window.user){
	        var Usr = $resource('user/:username',
	                                    { username: '@username' }, 
	                                    { update: { method: 'POST' } });

	        var u = new Usr(window.user);
	        u.$get(function(response){
	        	_this._data.user.follows = response.follows;
	        })
	    }else{
            var Usr = $resource('userip',
                                { }, 
                                { update: { method: 'POST' } });
            Usr.get(function(response){
                console.log(response)
                window.unAuthUserIp = response.ip;
            })
        }

        return _this._data;
    }
]);
