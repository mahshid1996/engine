const logger  = require( '../libs/logger.js');
const  masterConfigsModel   = require( '../models/masterConfigsModel.js');
const _  = require( 'lodash');
const { FTPConnection }  = require( '../service/ftp.js');
const { SFTPConnection }  = require( '../service/sftp.js');

 const configAddress = async (input) => {
    // Get current time
    var time = new Date();
    //Getting supplierProduct info details
    var supplierProductInfo = await masterConfigsModel.find({
        "name" : "FTP_config"
    });
    logger.applog(
        'info',
        time,
        'supplierProductInfo:' + JSON.stringify(supplierProductInfo)
    );

    //Checking supplierProductInfo
    if (!_.isEqual(supplierProductInfo.length, 0)) {
        //Checking configCharacteristics item in supplierProductInfo
        if (
            _.isEqual(
                supplierProductInfo[0].configCharacteristics.length,
                0
            )
        ) {
            logger.applog(
                'error',
                time,
                'configCharacteristics item is empty'
            );
        } else {
            //We hold, names of 'configCharacteristics' as the keys and values of 'configCharacteristicsValues' as the values in map.
            var map = new Map();
            for (
                var i = 0;
                i <
                supplierProductInfo[0].configCharacteristics.length;
                i++
            ) {
                map.set(
                    supplierProductInfo[0].configCharacteristics[i]
                        .code,
                    supplierProductInfo[0].configCharacteristics[i]
                        .configCharacteristicsValues[0].value
                );
            }

            //Checking requirement items of configCharacteristics for FTP/SFTP server
            if (_.isEqual(map.get('remote server output path'), undefined)) {
                logger.applog(
                    'error',
                    time,
                    `'remote server output path' feature of 'configCharacteristics' is ${map.get(
                        'ftpAddress'
                    )}`
                );
            } else if (_.isEqual(map.get('remote server port'), undefined)) {
                logger.applog(
                    'error',
                    time,
                    `'remote server port' feature of 'configCharacteristics' is ${map.get(
                        'ftpPort'
                    )}`
                );
            } else if (_.isEqual(map.get('username'), undefined)) {
                logger.applog(
                    'error',
                    time,
                    `'user' feature of 'configCharacteristics' is ${map.get(
                        'username'
                    )}`
                );
            } else if (_.isEqual(map.get('password'), undefined)) {
                logger.applog(
                    'error',
                    time,
                    `'password' feature of 'configCharacteristics' is ${map.get(
                        'password'
                    )}`
                );
            } else {

                //Upload or Download files based on config type(normal -> ftp/secure ->sftp)
                if (
                    !_.isEqual(map.get('remote server type'), undefined) ||
                    !_.isEmpty(map.get('remote server type'))
                ) {
                    if (_.isEqual(map.get('remote server type'), 'FTP')) {
                        //checking the input path
                        if (
                            !_.isEqual(
                                map.get('remote server input path'),
                                undefined
                            ) &&
                            !_.isEmpty(map.get('remote server input path'))
                        ) {
                            remotePath = map.get('remote server input path');
                        }
                        logger.applog(
                            'info',
                            time,
                            'Input Path Of FTP Is:' +
                                JSON.stringify(map.get('remote server input path'))
                        );

                        //simordersInfo[0].inpFileManagementInfo.fileName
                        FTPConnection(
                            map.get('remote server input path'),
                            map.get('remote server address'),
                            map.get('username'),
                            map.get('password'),
                            input,
                            'output.csv',
                            remotePath
                        );
                    } else if (
                        _.isEqual(map.get('remote server type'), 'SFTP')
                    ) {
                        //checking the input path
                        if (
                            !_.isEqual(
                                map.get('remote server input path'),
                                undefined
                            ) &&
                            !_.isEmpty(map.get('remote server input path'))
                        ) {
                            remotePath = map.get('remote server input path');
                        }
                        logger.applog(
                            'info',
                            time,
                            'Input Path Of SFTP Is:' +
                                JSON.stringify(map.get('remote server input path'))
                        );
                        SFTPConnection(
                            map.get('remote server input path'),
                            map.get('remote server address'),
                            map.get('username'),
                            map.get('password'),
                            input,
                            'output.csv',
                            remotePath
                        );
                    }
                } else {
                    logger.applog(
                        'error',
                        time,
                        'Type of remote server is undefined'
                    );
                }
            }
        }
    } else {
        logger.applog('error', time, 'SupplierProduct is empty');
    }
};
module.exports = {
    configAddress
  };