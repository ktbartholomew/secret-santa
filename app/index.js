var util = require('util');
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
  log.debug('Finding user with access_token: ' + token);
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
  return games.findOne({id: gameId})
  .then(function (game) {
    if(!game) {
      return Q.reject('No game found with id: ' + gameId);
    }

    if(! _.find(game.participants, {id: userId})) {
      return Q.reject('Participant ' + userId + ' not found in game ' + gameId);
    }

    delete game._id;

    _.map(game.participants, function (participant) {
      if(participant.id !== userId) {
        delete participant.santa.recipient;
      }

      return participant;
    });

    return Q.resolve(game);
  });
};

app.get('/api/games/:gameId', function (req, res) {
  log.info(util.format('[%s] GET /api/games/%s', new Date(), req.params.gameId));
  return getCurrentUser(req.get('X-Access-Token'))
  .then(function (user) {
    log.debug('getCurrentUser: ' + JSON.stringify(user));
    return getGameForUser(req.params.gameId, user.id);
  })
  .then(function (game) {
    res.send(game);
  })
  .catch(function (error) {
    log.error(JSON.stringify(error));
    res.status(404);
    res.end();
  });
});

app.post('/api/games', bodyParser.json(), function (req, res) {
  log.info(util.format('[%s] POST /api/games', new Date()));
  var crypto = require('crypto');
  req.locals = {};
  var game;

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
    return scramble(req, req.body);
  })
  .then(function (scrambled) {
    log.debug(scrambled);
    game = scrambled;
    return games.insert(scrambled);
  })
  .then(function () {
    res.send({id: game.id});
  })
  .catch(function (error) {
    log.error(error);
    res.status(400);
    res.send(error);
  });
});

app.put('/api/games/:gameId/likes', bodyParser.json(), function (req, res) {
  log.info(util.format('[%s] PUT /api/games/%s', new Date(), req.params.gameId));
  var currentUser;

  return getCurrentUser(req.get('X-Access-Token'))
  .then(function (user) {
    currentUser = user;
    return games.findOne({id: req.params.gameId});
  })
  .then(function (game) {
    var participantIndex = _.findIndex(game.participants, {id: currentUser.id});
    var $set = {};
    var likesKey = util.format('participants.%s.santa.likes', participantIndex);
    var dislikesKey = util.format('participants.%s.santa.dislikes', participantIndex);

    $set[likesKey] = req.body.likes;
    $set[dislikesKey] = req.body.dislikes;

    return games.update({id: game.id}, {
      $set: $set
    });
  })
  .then(function () {
    return getGameForUser(req.params.gameId, currentUser.id);
  })
  .then(function (game) {
    res.send(game);
  })
  .catch(function (error) {
    log.error(error);
    res.status(404);
    res.send(error);
  });
});

var port = process.env.NODE_PORT || 3000;
app.listen(port, '0.0.0.0', function () {
  log.log('info', 'Server listening at http://%s:%s/ ...', this.address().address, this.address().port);
});
