var angular = require('angular');

module.exports = 'routers';

angular.module(module.exports, [require('angular-ui-router')]).config([
  '$locationProvider',
  '$urlRouterProvider',
  '$stateProvider',
  function($locationProvider, $urlRouterProvider, $stateProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $urlRouterProvider.otherwise('/login');

    var facebookLoginStatus = [
      '$facebook',
      function($facebook) {
        return $facebook.getLoginStatus();
      }
    ];

    var currentUser = [
      '$facebook',
      function($facebook) {
        return $facebook.getMe();
      }
    ];

    var setPageTitle = function(title) {
      return [
        '$pageTitle',
        '$q',
        function($pageTitle, $q) {
          $pageTitle.set(title);

          return $q.resolve(title);
        }
      ];
    };

    var game = [
      '$game',
      '$q',
      '$state',
      '$stateParams',
      function($game, $q, $state, $stateParams) {
        return $game
          .getGame($stateParams.gameId)
          .then(function(game) {
            return $q.resolve(game);
          })
          .catch(function() {
            $state.go('app.game');
          });
      }
    ];

    var requireLogin = [
      'facebookLoginStatus',
      '$rootScope',
      '$state',
      '$location',
      '$q',
      function(facebookLoginStatus, $rootScope, $state, $location, $q) {
        if (!facebookLoginStatus.authResponse) {
          $rootScope.afterLoginPath = $location.path();
          $state.go('login');
        }

        return $q.resolve();
      }
    ];

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
          facebookLogin: [
            '$facebook',
            '$q',
            '$state',
            function($facebook, $q, $state) {
              return $facebook
                .getLoginStatus()
                .then(function(status) {
                  if (status.status === 'connected') {
                    return $state.go('app.game');
                  }

                  return $q.resolve(status);
                })
                .catch(function(err) {
                  console.log(err);
                });
            }
          ],
          pageTitle: setPageTitle('Log in with Facebook')
        },
        views: {
          app: {
            controller: 'LoginCtrl as login',
            templateUrl: '/src/js/login/login.html'
          }
        }
      })
      .state('app.game', {
        url: '/game',
        resolve: {
          pageTitle: setPageTitle('Join game')
        },
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
          currentUser: currentUser,
          game: game,
          pageTitle: [
            '$pageTitle',
            '$q',
            'game',
            function($pageTitle, $q, game) {
              $pageTitle.set(game.name);
              return $q.resolve(game.name);
            }
          ]
        },
        views: {
          'app@': {
            controllerProvider: [
              '$controller',
              '$rootScope',
              'currentUser',
              'game',
              function($controller, $rootScope, currentUser, game) {
                var controllerExpression =
                  game.status === 'open'
                    ? 'ViewOpenCtrl as view'
                    : 'ViewClosedCtrl as view';

                $controller(controllerExpression, {
                  $scope: $rootScope.$new(),
                  currentUser: currentUser,
                  game: game
                });

                return controllerExpression;
              }
            ],
            templateProvider: [
              '$http',
              '$templateCache',
              'game',
              function($http, $templateCache, game) {
                var templateUrl =
                  game.status === 'open'
                    ? '/src/js/view/view-open.html'
                    : '/src/js/view/view-closed.html';

                return $http.get(templateUrl).then(function(response) {
                  $templateCache.put(templateUrl, response.data);

                  return $templateCache.get(templateUrl);
                });
              }
            ]
          }
        }
      })
      .state('app.game.edit', {
        url: '/edit/:gameId',
        resolve: {
          currentUser: currentUser,
          game: game,
          isOrganizer: [
            'currentUser',
            'game',
            '$q',
            '$state',
            function(currentUser, game, $q, $state) {
              if (currentUser.id === game.organizer.id) {
                return $q.resolve(true);
              }

              $state.go('app.game.view', {gameId: game.id});
              return $q.reject(false);
            }
          ]
        },
        views: {
          'app@': {
            controller: 'EditCtrl as edit',
            templateUrl: '/src/js/view/edit.html'
          }
        }
      })
      .state('app.game.new', {
        url: '/new',
        resolve: {
          pageTitle: setPageTitle('New game')
        },
        views: {
          'app@': {
            controller: 'NewCtrl as new',
            templateUrl: '/src/js/new/new.html'
          }
        }
      })
      .state('privacry', {
        url: '/privacy',
        resolve: {
          pageTitle: setPageTitle('Privacy Policy')
        },
        views: {
          'app@': {
            templateUrl: '/src/js/privacy/index.html'
          }
        }
      });
  }
]);
