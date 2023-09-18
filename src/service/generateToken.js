const jwt = require('jsonwebtoken');
const logger = require('../libs/logger.js');
module.exports.generateJWTtoken = function (user) {
  return new Promise(function (resolve) {
    jwt.sign({ user }, "secretkey", (err, token) => {
      let time = new Date();
      if (err) {
        logger.applog('error', time, `Tocken generation error ${JSON.stringify(err)}`);
        resolve(err);
      } else {
        logger.applog('info', time, 'Tocken generated');
        resolve(token);
      }
    });
  });
}
