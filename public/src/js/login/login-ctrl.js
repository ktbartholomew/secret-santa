var angular = require('angular');

module.exports = 'login.login-ctrl';

angular.module(module.exports, []).controller('LoginCtrl', [
  '$facebook',
  '$location',
  '$rootScope',
  '$state',
  function($facebook, $location, $rootScope, $state) {
    this.login = function() {
      $facebook.login().then(function(response) {
        if ($rootScope.afterLoginPath) {
          $location.path($rootScope.afterLoginPath);
          $rootScope.afterLoginPath = null;

          return;
        }

        return $state.go('app.game');
      });
    };
  }
]);
