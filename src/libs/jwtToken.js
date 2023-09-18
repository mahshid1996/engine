const jwt = require('jsonwebtoken');
const config = require('config');

const user = {
    sub: 'drmInternal',
    permissions: 'drm.*'
};

const jwtTokenGenerator = async () => {
    return {
        access_token: jwt.sign(user, config.jwt.secret)
    };
};


module.exports = {
    jwtTokenGenerator
  };

