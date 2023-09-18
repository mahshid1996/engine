const logger = require('../../libs/logger.js');
const  masterConfigsModel  = require( '../../models/masterConfigsModel.js');
const _ = require( 'lodash');
const fs = require( 'fs-extra');
const sftpClient = require( 'ssh2-sftp-client');
const ftp = require( 'basic-ftp');
const replaceExt = require( 'replace-ext');

 const outFileAddress = async (input, OUTFileName) => {

    // Get current time
    var time = new Date();

    //Getting supplierProduct info
    var supplierProductInfo = await masterConfigsModel.find({   "name" : "FTP_config" })

    //Checking configCharacteristics item in supplierProductInfo
    if(!_.isEqual(supplierProductInfo.length,0)){
        if (_.isEqual(supplierProductInfo[0].configCharacteristics.length, 0)) {
            logger.applog('error', time, 'configCharacteristics item is empty');
        } else {
            //We hold, names of 'configCharacteristics' as the keys and values of 'configCharacteristicsValues' as the values in map.
            var map = new Map();
            for (var i = 0; i < supplierProductInfo[0].configCharacteristics.length; i++) {
                map.set(supplierProductInfo[0].configCharacteristics[i].code, supplierProductInfo[0].configCharacteristics[i].configCharacteristicsValues[0].value);
            }

            //Checking requirement items of configCharacteristics for FTP/SFTP server
            if(_.isEqual(map.get('ftpAddress'), undefined)){
                logger.applog('error', time, `'ftpAddress' feature of 'configCharacteristics' is ${map.get('ftpAddress')}`);
            }else if(_.isEqual(map.get('ftpPort'), undefined)){
                logger.applog('error', time, `'port' feature of 'configCharacteristics' is ${map.get('ftpPort')}`);
            }else if(_.isEqual(map.get('username'), undefined)){
                logger.applog('error', time, `'user' feature of 'configCharacteristics' is ${map.get('username')}`); 
            }else if(_.isEqual(map.get('password'), undefined)){
                logger.applog('error', time, `'password' feature of 'configCharacteristics' is ${map.get('password')}`);
            }else{

                var remotePath='';
                //Upload or Download files based on config type(normal -> ftp/secure ->sftp) 
                    if (!_.isEqual(map.get('ftpType'), undefined) || !_.isEmpty(map.get('ftpType'))) {
                        if (_.isEqual(map.get('ftpType'), "FTP")) {
                            //checking the out path
                            if(!_.isEqual(map.get('outFtpPath'), undefined) && !_.isEmpty(map.get('outFtpPath'))){
                                remotePath=map.get('outFtpPath');
                            }
                            logger.applog('info',time, 'Out Path Of FTP Is:'+ JSON.stringify(map.get('outFtpPath')));
                            FTPConnectionForOUTFile(map.get('ftpAddress'),map.get('ftpPort'),map.get('username'),map.get('password'), OUTFileName,simId,remotePath,app);
                        } else if(_.isEqual(map.get('ftpType'), "SFTP")) {
                            //checking the out path
                            if(!_.isEqual(map.get('outFtpPath'), undefined) && !_.isEmpty(map.get('outFtpPath'))){
                                remotePath=map.get('outFtpPath');
                            }
                            logger.applog('info',time, 'Out Path Of SFTP Is:'+ JSON.stringify(map.get('outFtpPath')));
                            SFTPConnectionForOUTFile(map.get('ftpAddress'),map.get('ftpPort'),map.get('username'),map.get('password'),OUTFileName,simId,remotePath,app);
                        }
                    }else{
                        logger.applog('error',time, 'Type of remote server is undefined');
                    }

            }
        }
    }else{
        logger.applog('error',time, 'SupplierProduct is empty');
    }
}


/*
Retrieve a file from a remote FTP server
*/
const FTPConnectionForOUTFile = async (host, port, user, password, OUTFileName,simId,rPath,app) => {

    // Get current time
    var time = new Date();

    //Getting FTP or SFTP config
    var configAddress = {
        host: host,
        port: port,
        user: user,
        password: password,
        secure: false
    };
    logger.applog('info', time, 'configAddress:' + JSON.stringify(configAddress));

    //Creates a FTP client
    const client = new ftp.Client()
    client.ftp.verbose = true

    try {
        //Connecting to FTP with FTPConfigAddress 
        const connectionDetails = await client.access(configAddress);
        logger.applog('info',time,`Connection Details: ${JSON.stringify(connectionDetails)}`);
        

        //Showing list of files and directories
        const listDetails = await client.list();
        logger.applog('info',time,`List of Files and Directories: ${JSON.stringify(listDetails)}`);
        
        
        /*Create the file for storing remote file 
          The First path is for the destination side
          The Second path is for remote side
        */
        logger.applog('info',time,`File Name And File Path Before transferring: ${rPath}${OUTFileName}`);
        //Replacing a file extension with another one[out -> inp]
        var newPath = replaceExt(OUTFileName, '.inp');
        await client.downloadTo(`/tmp/COPY_${newPath}`, `${rPath}${OUTFileName}`)
        const destinationPath = `/tmp/COPY_${newPath}`;
        logger.applog('info',time,`File Name And File Path After transferring: ${destinationPath}`);

    }
    catch (err) {
        logger.applog('error',time,'Error While FTP Process:', JSON.stringify(err));
    }
     client.close();

}




/*
Retrieve a file from a remote SFTP server
*/
const SFTPConnectionForOUTFile = async (sftphost, sftpport, sftpuser, sftppassword,OUTFileName,simId,outPath,app) => {

     //Getting FTP or SFTP config
     var config = {
        host: sftphost,
        port: sftpport,
        user: sftpuser,
        password: sftppassword
    };
    logger.applog('info', time, 'SFTP config:' + JSON.stringify(config));

    // Get current time
    var time = new Date();
    logger.applog('info',time, 'Starting the SFTP Process For OUTFile');


    //Creates a SFTP client
    const sftp = new sftpClient();

    let remotePath = `${outPath}${OUTFileName}`; //outPath;
     var dst = `service/SFTPOutFile.inp`;
     fs.createFile(dst, function(err) {
        console.log(err); //null
      })

      //Getting list of data and Uploado to remote path
    sftp.connect(config)
    .then(() => {
        return sftp.get(remotePath, dst);
    })
    .then(() => {
        sftp.end();
    })
    .catch(err => {
        console.error(err.message);
    });

}


module.exports = {
    outFileAddress,
    FTPConnectionForOUTFile,
    SFTPConnectionForOUTFile
  };