var angular = require('angular');
var _ = require('lodash');

var moduleName = 'view.view-ctrl';
module.exports = moduleName;

angular.module(moduleName, [
  require('../services/game')
])
.controller('ViewCtrl', ['$facebook', '$game', '$q', 'facebookLoginStatus', 'game', function ($facebook, $game, $q, facebookLoginStatus, game) {
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
