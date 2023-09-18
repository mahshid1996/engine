/*
uploading file on sftp server
*/
const logger = require('../libs/logger.js');
const Client = require('ssh2-sftp-client');
const fs = require('fs-extra');
const path = require('path');

const SFTPConnection = (host, port, user, password, data, filename, remoteFilePath) => {
  // Get current time
  var t0 = new Date();

  // SFTP server configuration
  const SFTPConfig = {
    host: host,
    port: port,
    user: user,
    password: password,
  };
  logger.applog('info', t0, `host: ${host}, port: ${port}, user: ${user}, password: ${password}`);

  try {
    logger.applog('info', t0, 'Starting the SFTP Process');
    //Creating file contains content of SIMOrder Report
    const currentDirectory = process.cwd(); //Get the current working directory (project directory)
    const filePath = path.join(currentDirectory, 'sftpFile.txt'); //Specify the file path relative to the current working directory

    //Write data to a file
    fs.writeFile(filePath, data, async (err) => {
      if (err) {
        logger.applog('error', t0, `Error writing SFTP file: ${err}`);
      } else {
        logger.applog('info', t0, `Data written to SFTP file successfully.`);
        try {
          await uploadingInputFile(SFTPConfig, filePath, remoteFilePath, filename);
        } catch (err) {
          logger.applog('info', t0, `Error while SFTP Uploading Process: ${err}`);
        }
      }
    });

  } catch (err) {
    logger.applog('error', t0, `Error before SFTP Uploading Process: ${err}`);
  }
}

async function uploadingInputFile(SFTPConfig, filePath, remoteFilePath, filename) {
  // Get current time
  var t0 = new Date();

  //Creates a SFTP client
  const sftp = new Client();

  const timestamp = new Date().getTime();
  const fileNameInRemoteServer = `${timestamp}_${filename}_SFTP.inp`;
  //remoteFilePath is like this '/' or '/test/'
  remoteFilePath = `${remoteFilePath}${fileNameInRemoteServer}`; //Specify the remote file path
  logger.applog('info', t0, `The remote path in sftp server is: ${remoteFilePath}`);

  // Connect to the SFTP server
  logger.applog('info', t0, 'Connecting to SFTP server...');
  await sftp.connect(SFTPConfig);
  logger.applog('info', t0, 'Connected to SFTP server.');

  // Get the list of data and Upload to the remote path
  logger.applog('info', t0, 'Getting the list of data...');

  logger.applog('info', t0, 'Uploading the file...');
  await sftp.put(filePath, remoteFilePath);
  logger.applog('info', t0, 'File uploaded successfully.');

  // Close the SFTP connection
  await sftp.end();
  logger.applog('info', t0, 'SFTP connection closed.');

  // Delete the temporary file after uploading
  await fs.promises.unlink(filePath);
  logger.applog('info', t0, 'SFTP File deleted');
}

module.exports = {
  SFTPConnection,
};
