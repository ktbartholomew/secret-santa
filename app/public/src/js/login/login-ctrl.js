var angular = require('angular');

module.exports = 'login.login-ctrl';

angular.module(module.exports, [])
.controller('LoginCtrl', ['$facebook', '$state', function ($facebook, $state) {
  this.login = function () {
    $facebook.login()
    .then(function (response) {
      $state.go('app.game');
    });
  };
}]);
