var angular = require('angular');
var _ = require('lodash');

var moduleName = 'home.home-ctrl';
module.exports = moduleName;

angular.module(moduleName, [])
.controller('HomeCtrl', ['$state', function ($state) {
  this.gameId = '';

  this.goToGame = function () {
    $state.go('app.game.view', {gameId: this.gameId});
  };
}]);
