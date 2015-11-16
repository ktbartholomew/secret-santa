var Q = require('q');
var _ = require('lodash');
var log = require('./log');

var shuffle = function (request, participants) {
  var i;
  var recipients = _.shuffle(participants);
  request.locals.shuffleCount += 1;

  if(request.locals.shuffleCount >= 100) {
    throw 'Couldn\'t successfully shuffle after 100 attempts.';
  }

  if(participants.length == 1) {
    throw 'Games must have more than one participant.';
  }

  for(i = 0; i < participants.length; i++) {
    if(participants[i].id == recipients[i].id) {
      log.debug('CONFLICT! (assigned to self) shuffling again...');
      return shuffle(request, participants);
    }

    if(participants[i].santa.exclusions.indexOf(recipients[i].id) !== -1) {
      log.debug('CONFLICT! (assigned from exclusion list) shuffling again...');
      return shuffle(request, participants);
    }
  }

  for(i = 0; i < participants.length; i++) {
    log.debug(recipients[i].id);
    participants[i].santa.recipient = recipients[i].id;
  }
  log.debug(participants);
  return participants;
};

module.exports = function (request, game) {
  request.locals.shuffleCount = request.locals.shuffleCount || 0;
  game.participants = shuffle(request, game.participants);
  return Q.resolve(game);
};
