var angular = require('angular');
var _ = require('lodash');

var moduleName = 'view.view-ctrl';
module.exports = moduleName;

angular.module(moduleName, [
  require('../services/game')
])
.controller('ViewOpenCtrl', ['$facebook', '$game', '$q', '$state', '$stateParams', '$timeout', 'currentUser', 'game', function ($facebook, $game, $q, $state, $stateParams, $timeout, currentUser, game) {
  this.game = game;
  this.likes = '';
  this.dislikes = '';
  this.saveInProgress = false;

  $timeout(function () {
    this.gameUrl = window.location.toString();
  }.bind(this), 200);

  this.isParticipant = function () {
    return _.find(this.game.participants, {id: currentUser.id});
  };

  if(this.isParticipant()) {
    this.likes = _.find(this.game.participants, {id: currentUser.id}).santa.likes;
    this.dislikes = _.find(this.game.participants, {id: currentUser.id}).santa.dislikes;
  }

  this.isOrganizer = function () {
    return this.game.organizer.id == currentUser.id;
  };

  this.join = function () {
    this.saveInProgress = true;
    $game.join(game.id)
    .then(function (game) {
      this.game = game;
      this.saveInProgress = false;
    }.bind(this));
  };

  this.addLikes = function () {
    this.saveInProgress = true;

    $game.addLikes(game.id, {
      likes: this.likes,
      dislikes: this.dislikes
    })
    .then(function () {
      this.saveInProgress = false;
    }.bind(this))
    .catch(function () {
      this.saveInProgress = false;
    }.bind(this));
  };

  this.closeGame = function () {
    return $game.setStatus(game.id, 'closed')
    .then(function (result) {
      $state.go($state.current, $stateParams, {reload: true});
    });
  };
}])
.controller('ViewClosedCtrl', ['$facebook', '$game', '$q', 'game', function ($facebook, $game, $q, game) {
  this.participants = game.participants;
  this.recipient = {};
  this.recipientPhotoUrl = '';
  this.saveInProgress = false;

  this.addLikes = function () {
    this.saveInProgress = true;

    $game.addLikes(game.id, {
      likes: this.likes,
      dislikes: this.dislikes
    })
    .then(function () {
      this.saveInProgress = false;
    }.bind(this))
    .catch(function () {
      this.saveInProgress = false;
    }.bind(this));
  };

  $facebook.getMe()
  .then(function (me) {
    var myParticipant = _.find(game.participants, {id: me.id});
    var recipientId = myParticipant.santa.recipient;

    this.recipient = _.find(game.participants, {id: recipientId});
    this.likes = myParticipant.santa.likes;
    this.dislikes = myParticipant.santa.dislikes;

    return $q.resolve(this.recipient);
  }.bind(this))
  .then(function (recipient) {
    return $facebook.getPicture(recipient.id, 'large');
  })
  .then(function (picture) {
    this.recipientPhotoUrl = picture.data.url;
  }.bind(this));
}]);
