var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: process.env.LOG_LEVEL || 'debug',
      colorize: process.env.LOG_COLOR === 'true' || true
    })
  ]
});

logger.debug('Logger set up successfully');

module.exports = logger;
