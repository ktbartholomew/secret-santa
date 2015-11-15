var angular = require('angular');

var moduleName = 'services.facebook';
module.exports = moduleName;

angular.module(moduleName, [])
.provider('$facebook', [function () {
  var options = {};
  var loginStatus;

  FB.getLoginStatus(function (status) {
    loginStatus = status;
  });

  this.$get = ['$q', function ($q) {
    return {
      isLoggedIn: function () {
        return $q(function (resolve, reject) {
          FB.getLoginStatus(function (status) {
            if(status.status === 'connected') {
              resolve(status);
            }
            else {
              reject();
            }
          });
        });
      },
      getLoginStatus: function () {
        return $q(function (resolve, reject) {
          FB.getLoginStatus(function (status) {
            resolve(status);
          });
        });
      },
      getMe: function () {
        return this.isLoggedIn()
        .then(function (status) {
          return $q(function (resolve, reject) {
            FB.api('/me', {fields: 'first_name,name,picture'}, function (me) {
              resolve(me);
            });
          });
        });
      },
      getUser: function (id) {
        return $q(function (resolve, reject) {
          FB.api('/' + id, {fields: 'first_name,name,picture'}, function (user) {
            resolve(user);
          });
        });
      },
      getPicture: function (userId, type) {
        return $q(function (resolve, reject) {
          FB.api('/' + userId + '/picture', {type: type || 'large'}, function (picture) {
            resolve(picture);
          });
        });
      },
      findUsers: function (name, paging) {
        return $q(function (resolve, reject) {
          var offset = 0;
          if(paging) {
            offset = paging.match(/offset=(\d+)/)[1];
            console.log(offset);
          }
          FB.api('/search', {type: 'user', q: name, fields: 'first_name,name,picture', limit: 25, offset: offset}, function (results) {
            resolve(results);
          });
        });
      },
      login: function () {
        return $q(function (resolve, reject) {
          FB.login(function (response) {
            return resolve(response);
          }, {scope: 'public_profile,user_friends'});
        });
      }
    };
  }];

  this.config = function () {
    options = arguments[0];
  };
}]);
