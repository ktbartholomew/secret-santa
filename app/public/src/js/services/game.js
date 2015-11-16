var angular = require('angular');
var _ = require('lodash');

module.exports = 'services.game';

angular.module(module.exports, [])
.factory('$game', ['$facebook', '$http', '$q', function ($facebook, $http, $q) {
  return {
    participants: [],
    addParticipant: function (participant) {
      participant.santa = {
        exclusions: [],
        likes: '',
        dislikes: ''
      };

      if(!_.find(this.participants, {id: participant.id})) {
        this.participants.push(participant);
      }
    },
    addLikes: function (gameId, data) {
      return $facebook.getLoginStatus()
      .then(function (status) {
        if(!status.authResponse) {
          return $q.reject(status);
        }

        return $http({
          method: 'PUT',
          url: '/api/games/' + gameId + '/likes',
          headers: {
            'X-Access-Token': status.authResponse.accessToken
          },
          data: data
        });
      });
    },
    getGame: function (id) {
      return $facebook.getLoginStatus()
      .then(function (status) {
        if(!status.authResponse) {
          return $q.reject(status);
        }

        return $http({
          method: 'GET',
          url: '/api/games/' + id,
          headers: {
            'X-Access-Token': status.authResponse.accessToken
          }
        });
      })
      .then(function (response) {
        if(response.status >= 400) {
          return $q.reject(response.data);
        }
        
        return $q.resolve(response.data);
      });
    },
    create: function () {
      var game = {
        participants: this.participants
      };

      return $facebook.getLoginStatus()
      .then(function (status) {
        return $http({
          method: 'POST',
          url: '/api/games',
          headers: {
            'X-Access-Token': status.authResponse.accessToken
          },
          data: game
        });
      })
      .then(function (response) {
        if(response.status >= 400) {
          return $q.reject(response.data);
        }

        return $q.resolve(response.data);
      });
    }
  };
}]);
