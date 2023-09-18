const mongoose = require('mongoose');
const config = require('config');

const dbUrl = config.db.url;

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

module.exports = {
    db
  };