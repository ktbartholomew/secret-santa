var express = require('express');
var log = require('./log');
var bodyParser = require('body-parser');
var Q = require('q');
var _ = require('lodash');
var request = require('request-promise');
var scramble = require('./scramble');
var games = require('./games');
var app = express();

app.use(express.static('public'));

var GRAPH_API = 'https://graph.facebook.com/v2.5';

var getCurrentUser = function (token) {
  return request({
    url: GRAPH_API + '/me',
    qs: {
      fields: 'id,name',
      access_token: token
    },
    json: true
  });
};

var getGameForUser = function (gameId, userId) {
  log.debug(arguments);
  return Q.Promise(function (resolve, reject) {
    var game;

    if (_.find(games, {id: gameId})) {
      game = _.cloneDeep(_.find(games, {id: gameId}));
    }
    else {
      return reject();
    }

    _.map(game.participants, function (participant) {
      if(participant.id !== userId) {
        delete participant.santa.recipient;
      }

      return participant;
    });

    return resolve(game);
  });
};

app.get('/api/games/:gameId', function (req, res) {
  return getCurrentUser(req.get('X-Access-Token'))
  .then(function (user) {
    log.debug(user);
    return getGameForUser(req.params.gameId, user.id);
  })
  .then(function (game) {
    res.send(game);
  })
  .catch(function (error) {
    res.status(404);
    res.end();
  });
});

app.post('/api/games', bodyParser.json(), function (req, res) {
  var crypto = require('crypto');

  return getCurrentUser(req.get('X-Access-Token'))
  .then(function (user) {
    req.body.creator = user;
    return Q.ninvoke(crypto, 'randomBytes', 32);
  })
  .then(function (bytes) {
    return Q.resolve(bytes.toString('hex'));
  })
  .then(function (gameId) {
    req.body.id = gameId;

    return scramble(req.body);
  })
  .then(function (game) {
    return games.insert(game);
  })
  .then(function (result) {
    res.send(result);
  })
  .catch(function (error) {
    res.send(error);
  });
});

app.put('/api/games/:gameId/likes', bodyParser.json(), function (req, res) {
  return getCurrentUser(req.get('X-Access-Token'))
  .then(function (user) {
    var game = _.find(games, {id: req.params.gameId});

    _.map(game.participants, function (participant) {
      if(participant.id !== user.id) {
        return participant;
      }

      participant.santa.likes = req.body.likes;
      participant.santa.dislikes = req.body.dislikes;

      return participant;
    });

    return getGameForUser(req.params.gameId, user.id);
  })
  .then(function (game) {
    res.send(game);
  })
  .catch(function (error) {
    res.status(404);
    res.end();
  });
});

var port = process.env.NODE_PORT || 3000;
app.listen(port, '0.0.0.0', function () {
  log.log('info', 'Server listening at http://%s:%s/ ...', this.address().address, this.address().port);
});
