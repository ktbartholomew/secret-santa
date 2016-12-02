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

      if (!_.find(this.participants, {id: participant.id})) {
        this.participants.push(participant);
      }
    },
    removeParticipant: function (gameId, participantId) {
      return $facebook.getLoginStatus()
      .then(function (status) {
        if (!status.authResponse) {
          return $q.reject(status);
        }

        return $http({
          method: 'DELETE',
          url: '/api/games/' + gameId + '/participants/' + participantId,
          headers: {
            'X-Access-Token': status.authResponse.accessToken
          }
        });
      });
    },
    setExclusions: function (gameId, participantId, exclusions) {
      return $facebook.getLoginStatus()
      .then(function (status) {
        if (!status.authResponse) {
          return $q.reject(status);
        }

        return $http({
          method: 'PUT',
          url: '/api/games/' + gameId + '/participants/' + participantId + '/exclusions',
          headers: {
            'X-Access-Token': status.authResponse.accessToken
          },
          data: {
            exclusions: exclusions
          }
        });
      });
    },
    addLikes: function (gameId, data) {
      return $facebook.getLoginStatus()
      .then(function (status) {
        if (!status.authResponse) {
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
        if (!status.authResponse) {
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
        if (response.status >= 400) {
          return $q.reject(response.data);
        }

        return $q.resolve(response.data);
      });
    },
    join: function (gameId) {
      return $facebook.getLoginStatus()
      .then(function (status) {
        return $http({
          method: 'PUT',
          url: '/api/games/' + gameId + '/join',
          headers: {
            'X-Access-Token': status.authResponse.accessToken
          }
        });
      })
      .then(function (response) {
        if (response.status >= 400) {
          return $q.reject(response.data);
        }

        return $q.resolve(response.data);
      });
    },
    create: function (gameData) {
      gameData.participants = this.participants;

      return $facebook.getLoginStatus()
      .then(function (status) {
        return $http({
          method: 'POST',
          url: '/api/games',
          headers: {
            'X-Access-Token': status.authResponse.accessToken
          },
          data: gameData
        });
      })
      .then(function (response) {
        if (response.status >= 400) {
          return $q.reject(response.data);
        }

        return $q.resolve(response.data);
      });
    },
    setStatus: function (gameId, gameStatus) {
      return $facebook.getLoginStatus()
      .then(function (status) {
        if (!status.authResponse) {
          return $q.reject(status);
        }

        return $http({
          method: 'PUT',
          url: '/api/games/' + gameId + '/status',
          headers: {
            'X-Access-Token': status.authResponse.accessToken
          },
          data: {
            status: gameStatus
          }
        });
      })
      .then(function (response) {
        if (response.status >= 400) {
          return $q.reject(response.data);
        }

        return $q.resolve(response.data);
      });
    }
  };
}]);
