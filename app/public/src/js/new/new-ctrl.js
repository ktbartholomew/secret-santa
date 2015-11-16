var angular = require('angular');
var _ = require('lodash');

var moduleName = 'new.new-ctrl';
module.exports = moduleName;

angular.module(moduleName, [
  require('../services/game')
])
.controller('NewCtrl', ['$facebook', '$game', '$state', function ($facebook, $game, $state) {
  this.searchResults = [];
  this.manualId = '';
  this.participants = $game.participants;
  this.createInProgress = false;

  $facebook.getMe()
  .then(function (me) {
    $game.addParticipant(me);
  });

  this.updateSearch = function (paging) {
    $facebook.findUsers(this.search, paging)
    .then(function (users) {
      this.searchResults = users;
    }.bind(this));
  };

  this.addParticipantById = function () {
    $facebook.getUser(this.manualId)
    .then(function (user) {
      $game.addParticipant(user);
      this.manualId = '';
    }.bind(this));
  };

  this.toggleParticipant = function (user) {
    $game.addParticipant(user);
    this.search = '';
    this.searchResults = [];
  };

  this.createGame = function () {
    this.createInProgress = true;
    $game.create()
    .then(function (game) {
      $state.go('app.game.view', {gameId: game.id});
    }.bind(this))
    .catch(function () {
      this.createInProgress = false;
    }.bind(this));
  };
}]);
