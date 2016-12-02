var angular = require('angular');

module.exports = 'view.edit-ctrl';

angular.module(module.exports, [])
.controller('EditCtrl', [
  'currentUser',
  'game',
  '$game',
  '$q',
  '$state',
  function (currentUser, game, $game, $q, $state) {
    this.game = game;
    this.pendingDeletion = [];
    this.pendingExclusions = [];

    (function (game, exclusions) {
      for (var i = 0; i < game.participants.length; i++) {
        exclusions.push({
          participant: game.participants[i].id,
          exclusions: game.participants[i].santa.exclusions
        });
      }
    })(this.game, this.pendingExclusions);

    this.getPendingExclusions = function (participantId) {
      for (var i = 0; i < this.pendingExclusions.length; i++) {
        if (this.pendingExclusions[i].participant === participantId) {
          return this.pendingExclusions[i].exclusions;
        }
      }
    }.bind(this);

    this.removeParticipant = function (participantId) {
      this.pendingDeletion.push(participantId);
    }.bind(this);

    this.isPendingDeletion = function (participantId) {
      return (this.pendingDeletion.indexOf(participantId) !== -1);
    }.bind(this);

    this.getExclusionObject = function (participantId) {
      for (var i = 0; i < this.pendingExclusions.length; i++) {
        if (this.pendingExclusions[i].participant === participantId) {
          return this.pendingExclusions[i];
        }
      }
    };

    this.save = function () {
      var deletePromises = [];
      var exclusionPromises = [];

      this.pendingDeletion.forEach(function (participantId) {
        deletePromises.push(
          $game.removeParticipant(game.id, participantId)
        );
      });

      this.pendingExclusions.forEach(function (exclusionItem) {
        exclusionPromises.push(
          $game.setExclusions(game.id, exclusionItem.participant, exclusionItem.exclusions)
        );
      });

      $q.all(deletePromises)
      .then($q.all(exclusionPromises))
      .then(function () {
        $state.go('app.game.view', {gameId: game.id});
      });
      // console.log(this.pendingDeletion);
      // console.log(this.pendingExclusions);
    };
  }
]);
