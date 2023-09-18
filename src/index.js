const express = require('express');
const config = require('config');

const  {consume } = require('./libs/kafkaconnector.js');
const logger = require('./libs/logger.js');
const {db} = require( './libs/dbconnector.js');

// Initialized the application to use express
const app = express();

// Get current date time
let time = new Date();
db.on('open', () => {
    logger.applog('info', time, `Database connected!`);
});

db.on('reconnected', () => {
    logger.applog('info', time, `Database re-connected!`);
});

db.on('disconnected', () => {
    logger.applog('info', time, `Database disconnected!`);
});

db.on('error', () => {
    logger.applog('error', time, `Database connection failed!`);
    process.exit(1);
});


consume(app);

// Get server port from config
const serverPort = config.server.port;

// Get server host from config
const host = config.server.host;

// Start server at defined port
app.listen(serverPort, () => {
    logger.applog(
        'info',
        time,
        `Server running on http://${host}:${serverPort}`
    );
});
