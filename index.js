var util = require('util');
var path = require('path');
var express = require('express');
var log = require('./lib/log');
var bodyParser = require('body-parser');
var Q = require('q');
var _ = require('lodash');
var request = require('request-promise');
var scramble = require('./lib/scramble');
var games = require('./lib/games');
var app = express();

var GRAPH_API = 'https://graph.facebook.com/v3.2';

var getCurrentUser = function(token) {
  log.debug('Finding user with access_token: ' + token);
  return request({
    url: GRAPH_API + '/me',
    qs: {
      fields: 'id,name,first_name,email,picture.height(320)',
      access_token: token
    },
    json: true
  });
};

var getGameForUser = function(gameId, userId) {
  return games.findOne({id: gameId}).then(function(game) {
    if (!game) {
      return Q.reject('No game found with id: ' + gameId);
    }

    if (game.status !== 'open' && !_.find(game.participants, {id: userId})) {
      return Q.reject('Participant ' + userId + ' not found in game ' + gameId);
    }

    delete game._id;

    _.map(game.participants, function(participant) {
      delete participant.email;

      if (participant.id !== userId) {
        delete participant.santa.recipient;
      }

      return participant;
    });

    return Q.resolve(game);
  });
};

app.get('/api/games/:gameId', function(req, res) {
  log.info(
    util.format(
      '[%s] GET /api/games/%s',
      new Date().toJSON(),
      req.params.gameId
    )
  );
  return getCurrentUser(req.get('X-Access-Token'))
    .then(function(user) {
      log.debug('getCurrentUser: ' + JSON.stringify(user));
      return getGameForUser(req.params.gameId, user.id);
    })
    .then(function(game) {
      res.send(game);
    })
    .catch(function(error) {
      log.error(JSON.stringify(error));
      res.status(404);
      res.end();
    });
});

app.post('/api/games', bodyParser.json(), function(req, res) {
  log.info(util.format('[%s] POST /api/games', new Date().toJSON()));
  var crypto = require('crypto');
  req.locals = {};

  return getCurrentUser(req.get('X-Access-Token'))
    .then(function(user) {
      req.body.organizer = user;

      // don't want this hanging around
      delete req.body.organizer.email;

      req.body.created_date = new Date();
      req.body.status = 'open';
      req.body.id = crypto.randomBytes(16).toString('hex');

      return games.insert(req.body);
    })
    .then(function() {
      res.send({id: req.body.id});
    })
    .catch(function(error) {
      log.error(error);
      res.status(400);
      res.send(error);
    });
});

app.put(
  '/api/games/:gameId/participants/:participantId/exclusions',
  bodyParser.json(),
  function(req, res) {
    log.info(
      util.format('[%s] %s %s', new Date().toJSON(), req.method, req.url)
    );
    var currentUser;

    return getCurrentUser(req.get('X-Access-Token'))
      .then(function(user) {
        currentUser = user;
        return games.findOne({id: req.params.gameId});
      })
      .then(function(game) {
        // permissions and good request checks
        if (currentUser.id !== game.organizer.id) {
          res.status(401);
          throw new Error('Only the organizer can update exclusions.');
        }

        log.debug('updating exclusions', {
          game: req.params.gameId,
          participant: req.params.participantId,
          exclusions: req.body.exclusions
        });

        return games
          .update(
            {
              id: req.params.gameId,
              'participants.id': req.params.participantId
            },
            {
              $set: {
                'participants.$.santa.exclusions': req.body.exclusions
              }
            }
          )
          .then(function() {
            res.sendStatus(202);
          });
      })
      .catch(function(error) {
        log.warn(error);
        res.end();
      });
  }
);

app.delete('/api/games/:gameId/participants/:participantId', function(
  req,
  res
) {
  log.info(util.format('[%s] %s %s', new Date().toJSON(), req.method, req.url));
  var currentUser;

  return getCurrentUser(req.get('X-Access-Token'))
    .then(function(user) {
      currentUser = user;
      return games.findOne({id: req.params.gameId});
    })
    .then(function(game) {
      // permissions and good request checks
      if (currentUser.id !== game.organizer.id) {
        res.status(401);
        throw new Error('Only the organizer can remove participants.');
      }

      if (req.params.participantId === game.organizer.id) {
        res.status(400);
        throw new Error('The organizer cannot be removed.');
      }

      if (
        _.filter(game.participants, {id: req.params.participantId}).length === 0
      ) {
        res.status(404);
        throw new Error(
          util.format(
            'Participant %s does not exist in game %s',
            req.params.participantId,
            req.params.gameId
          )
        );
      }

      return games.update(
        {id: req.params.gameId},
        {
          $pull: {
            participants: {id: req.params.participantId}
          }
        }
      );
    })
    .then(function() {
      res.sendStatus(204);
    })
    .catch(function(error) {
      log.warn(error);
      res.end();
    });
});

app.put('/api/games/:gameId/status', bodyParser.json(), function(req, res) {
  log.info(
    util.format('[%s] PUT /api/games/%s/status', new Date(), req.params.gameId)
  );
  var currentUser;

  // everyday i'm shuffling
  req.locals = {};

  return getCurrentUser(req.get('X-Access-Token'))
    .then(function(user) {
      currentUser = user;
      return games.findOne({id: req.params.gameId});
    })
    .then(function(game) {
      // permissions and good request checks
      if (currentUser.id !== game.organizer.id) {
        throw new Error('Only the organizer can update a game’s status.');
      }

      if (['preparing', 'closed'].indexOf(req.body.status) === -1) {
        throw new Error('status must be "preparing" or "closed".');
      }

      if (req.body.status === 'preparing' && game.status !== 'open') {
        throw new Error(
          'status can only be set to "preparing" if it was previously "open".'
        );
      }

      return games.findOne({id: req.params.gameId});
    })
    .then(function(game) {
      if (req.body.status === 'closed') {
        return scramble(req, game);
      }

      return Q.resolve(game);
    })
    .then(function(scrambledGame) {
      return games.update(
        {id: scrambledGame.id},
        {
          $set: {
            status: req.body.status,
            participants: scrambledGame.participants
          }
        }
      );
    })
    .then(function() {
      return getGameForUser(req.params.gameId, currentUser.id);
    })
    .then(function(game) {
      res.send(game);
    })
    .catch(function(error) {
      log.error(error);
      res.status(400);
      res.send(error);
    });
});

app.put('/api/games/:gameId/likes', bodyParser.json(), function(req, res) {
  log.info(
    util.format('[%s] PUT /api/games/%s/likes', new Date(), req.params.gameId)
  );
  var currentUser;

  return getCurrentUser(req.get('X-Access-Token'))
    .then(function(user) {
      currentUser = user;
      return games.findOne({id: req.params.gameId});
    })
    .then(function(game) {
      var participantIndex = _.findIndex(game.participants, {
        id: currentUser.id
      });
      var $set = {};
      var likesKey = util.format(
        'participants.%s.santa.likes',
        participantIndex
      );
      var dislikesKey = util.format(
        'participants.%s.santa.dislikes',
        participantIndex
      );

      $set[likesKey] = req.body.likes;
      $set[dislikesKey] = req.body.dislikes;

      return games.update(
        {id: game.id},
        {
          $set: $set
        }
      );
    })
    .then(function() {
      return getGameForUser(req.params.gameId, currentUser.id);
    })
    .then(function(game) {
      res.send(game);
    })
    .catch(function(error) {
      log.error(error);
      res.status(400);
      res.send(error);
    });
});

app.put('/api/games/:gameId/join', function(req, res) {
  log.info(
    util.format('[%s] PUT /api/games/%s/join', new Date(), req.params.gameId)
  );
  var currentUser;

  return getCurrentUser(req.get('X-Access-Token'))
    .then(function(user) {
      currentUser = user;
      return games.findOne({id: req.params.gameId});
    })
    .then(function(game) {
      if (game.status !== 'open') {
        throw new Error('This game is no longer accepting new participants.');
      }

      if (_.find(game.participants, {id: currentUser.id})) {
        throw new Error(
          util.format(
            'User %s is already a participant in game %s and cannot join again',
            currentUser.name,
            req.params.gameId
          )
        );
      }

      var newParticipant = currentUser;
      newParticipant.santa = {
        exclusions: [],
        likes: '',
        dislikes: ''
      };

      return games.update(
        {id: game.id},
        {
          $push: {
            participants: newParticipant
          }
        }
      );
    })
    .then(function() {
      return getGameForUser(req.params.gameId, currentUser.id);
    })
    .then(function(game) {
      res.send(game);
    })
    .catch(function(error) {
      log.error(error);
      res.status(400);
      res.send(error);
    });
});

app.get(['/', '/login*', '/game*'], function(req, res, next) {
  log.info(util.format('[%s] %s %s', new Date().toJSON(), req.method, req.url));
  // Just send the index.html for other files to support HTML5Mode
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

var port = process.env.NODE_PORT || 3000;
app.listen(port, '0.0.0.0', function() {
  log.log(
    'info',
    'Server listening at http://%s:%s/ ...',
    this.address().address,
    this.address().port
  );
});
