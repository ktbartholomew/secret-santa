var angular = require('angular');

module.exports = 'routers';

angular.module(module.exports, [
  require('angular-ui-router')
])
.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/login');

  var facebookLoginStatus = ['$facebook', function ($facebook) {
    return $facebook.getLoginStatus();
  }];

  var requireLogin = ['facebookLoginStatus', '$rootScope', '$state', '$location', function (facebookLoginStatus, $rootScope, $state, $location) {
    if(!facebookLoginStatus.authResponse) {
      $rootScope.afterLoginPath = $location.path();
      $state.go('login');
    }
  }];

  $stateProvider
  .state('app', {
    abstract: true,
    resolve: {
      facebookLoginStatus: facebookLoginStatus,
      requireLogin: requireLogin
    }
  })
  .state('login', {
    url: '/login',
    authenticate: false,
    resolve: {
      facebookLogin: ['$facebook', '$q', '$state', function ($facebook, $q, $state) {
        return $facebook.getLoginStatus()
        .then(function (status) {
          if(status.status === 'connected') {
            return $state.go('app.game');
          }

          return $q.resolve(status);
        });
      }]
    },
    views: {
      'app': {
        controller: 'LoginCtrl as login',
        templateUrl: '/src/js/login/login.html'
      }
    }
  })
  .state('app.game', {
    url: '/game',
    views: {
      'app@': {
        controller: 'HomeCtrl as home',
        templateUrl: '/src/js/home/home.html'
      }
    }
  })
  .state('app.game.view', {
    url: '/view/:gameId',
    resolve: {
      game: ['$game', '$q', '$state', '$stateParams', function ($game, $q, $state, $stateParams) {
        return $game.getGame($stateParams.gameId)
        .then(function (game) {
          return $q.resolve(game);
        })
        .catch(function () {
          $state.go('app.game');
          return $q.reject();
        });
      }]
    },
    views: {
      'app@': {
        controller: 'ViewCtrl as view',
        templateUrl: '/src/js/view/view.html'
      }
    }
  })
  .state('app.game.new', {
    url: '/new',
    views: {
      'app@': {
        controller: 'NewCtrl as new',
        templateUrl: '/src/js/new/new.html',
      }
    }
  });
}]);
