var Q = require('q');
var _ = require('lodash');
var log = require('./log');

var shuffle = function (participants) {
  var i;
  var recipients = _.shuffle(participants);

  for(i = 0; i < participants.length; i++) {
    if(participants[i].id == recipients[i].id) {
      log.debug('CONFLICT! shuffling again');
      return shuffle(participants);
    }
  }

  for(i = 0; i < participants.length; i++) {
    log.debug(recipients[i].id);
    participants[i].santa.recipient = recipients[i].id;
  }
  log.debug(participants);
  return participants;
};

module.exports = function (game) {
  game.participants = shuffle(game.participants);
  return Q.resolve(game);
};
