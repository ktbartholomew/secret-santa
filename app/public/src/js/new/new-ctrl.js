var angular = require('angular');
var _ = require('lodash');

module.exports = angular.module('new.new-ctrl', [
  require('../services/game')
])
.controller('NewCtrl', ['$facebook', '$game', '$state', function ($facebook, $game, $state) {
  this.name = '';
  this.price_instructions = '';
  this.open_until = '';
  this.createInProgress = false;

  $facebook.getMe()
  .then(function (me) {
    $game.addParticipant(me);
  });

  this.createGame = function () {
    this.createInProgress = true;
    $game.create({
      name: this.name,
      price_instructions: this.price_instructions,
      open_until: this.open_until
    })
    .then(function (game) {
      $state.go('app.game.view', {gameId: game.id});
    }.bind(this))
    .catch(function () {
      this.createInProgress = false;
    }.bind(this));
  };
}]).name;
