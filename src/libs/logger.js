const {
    createLogger,
    format,
    transports
  } = require('winston');
  
  var moment = require('moment');
  
  const config = require('config');
  const logger = createLogger({
    level: config.loggerLevel,
    
    format: format.combine(
      format.splat(),
      format.simple(),
      format.json()
    ),
    transports: [
      new transports.Console()
    ],
  });
  
  function applog(level, interval, ...data) {
    // Get current date time
    var date = new Date();
    const current = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  
    // Get elapsed time in milliseconds
    var elapsedTime = (date - interval) / 1000;
  
    // Configure application logger
    return logger.log({
      'level': level,
      'ts': current,
      'microservice': 'drm-engine',
      'msg': data[0],
      'elapsed-ms': elapsedTime
    });
  }
  
  
  module.exports = {
    logger,
    applog
  };
  