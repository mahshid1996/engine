/*
uploading file on ftp server
*/
const Client = require('ftp');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');


const logger = require('../libs/logger.js');

const FTPConnection = (host, port, user, password, data, filename, remoteFilePath) => {

  const t0 = new Date(); // Get current time
  logger.applog('info', t0, 'Starting the FTP Process');
  logger.applog('info', t0, `host: ${host}, port: ${port}, user: ${user}, password: ${password}`);
  const currentDirectory = process.cwd(); //Get the current working directory (project directory)
  const filePath = path.join(currentDirectory, 'ftpFile.txt'); //Specify the file path relative to the current working directory

  //Write data to a file
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      logger.applog('error',t0, `Error writing FTP file: ${JSON.stringify(err.message)}`);
    } else {
      logger.applog('info',t0, `Data written to FTP file successfully.`);
      const timestamp = new Date().getTime();
      const fileNameInRemoteServer = `${timestamp}_${filename}_FTP.inp`;

      //remoteFilePath is like this '/' or '/test/'
      remoteFilePath = `${remoteFilePath}${fileNameInRemoteServer}`; //Specify the remote file path
      logger.applog('info',t0, `The remote path in ftp server is: ${remoteFilePath}`);
      const client = new Client();

      client.on('ready', function () {
        client.put(filePath, remoteFilePath, function (err) {
          if (err) {
            logger.applog('error',t0, `The FTP server is not ready to connect and erros is: ${err}`);
          }
          client.end(); //Close the FTP connection after the upload is complete
        });
      });

      //Event listener for handling FTP connection errors
      client.on('error', function (err) {
        logger.applog('info',t0, `FTP connection error: ${err}`);
          //Call the function to delete the file and log the result
          deleteFileAndLog(filePath, t0);
      });

      client.on('end', function () {
        //Call the function to delete the file and log the result
        deleteFileAndLog(filePath, t0);
      });

      //Connect to the FTP server
      client.connect({
        host,
        port,
        user,
        password,
      });
    }
  });
};

//Function to handle file deletion and logging
const deleteFileAndLog = (filePath, t0) => {
 //Removing the local file after the FTP connection is closed
 fs.unlink(filePath, (err) => {
  if (err) {
    logger.applog('error',t0, `Error while removing interface ftp file is: ${err}`);
    throw err;
  }
  logger.applog('info', t0, 'FTP File deleted');
});
};

module.exports = {
  FTPConnection
};
