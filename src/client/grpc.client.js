/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { jwtTokenGenerator } = require('../libs/jwtToken.js');
const logger = require('../libs/logger.js');

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

var meta = new grpc.Metadata();

//var client;
//Handling all clients
async function clientdata(key, arg, service, appIp) {
    var packageDefinition;
    var proto;
    var obj;
    var client;



    //creating client based on the service name and request transformation
    switch (service) {
        case 'logical':
            packageDefinition = protoLoader.loadSync(
                './src/protos/logical-resource.proto',
                options
            );
            proto = grpc.loadPackageDefinition(packageDefinition);
            client = new proto.protos.LogicalResource(
                appIp,
                grpc.credentials.createInsecure()
            );

            obj = {
                id: '',
                logicalResource: {}
            };
            obj.logicalResource = arg;
            obj.id = arg.id;

            /* code added */
            return creteMetadata(key, obj, arg, client);
        /* code end  */

        case 'resourcecategory':
            packageDefinition = protoLoader.loadSync(
                './src/protos/resource-category.proto',
                options
            );
            proto = grpc.loadPackageDefinition(packageDefinition);
            client = new proto.protos.ResourceCategory(
                appIp,
                grpc.credentials.createInsecure()
            );

            obj = {
                id: '',
                resourceCategory: {}
            };
            obj.resourceCategory = arg;
            obj.id = arg.id;

            /* code added */
            return creteMetadata(key, obj, arg, client);
        /* code end  */

        case 'physical':
            packageDefinition = protoLoader.loadSync(
                './src/protos/physical-resource.proto',
                options
            );
            proto = grpc.loadPackageDefinition(packageDefinition);
            var pclient = new proto.protos.PhysicalResource(
                appIp,
                grpc.credentials.createInsecure()
            );
            obj = {
                id: '',
                physicalResource: {}
            };
            obj.physicalResource = arg;
            obj.id = arg.id;
            /* code added */
            return creteMetadata(key, obj, arg, pclient);
        /* code end  */
        case 'poolCapacityDelete':
            // added for the pool capacity
            packageDefinition = protoLoader.loadSync(
                './src/protos/pool-capacity.proto',
                options
            );
            proto = grpc.loadPackageDefinition(packageDefinition);
            client = new proto.protos.PoolCapacity(
                appIp,
                grpc.credentials.createInsecure()
            );




          /*   const poolCapacityDef = protoLoader.loadSync(
                            './src/protos/pool-capacity.proto',
                             options);
            const poolCapacityProto = grpc.loadPackageDefinition(poolCapacityDef);
            const poolCapacityClient = new poolCapacityProto.protos.PoolCapacity(
                `dns:///${config.pool.gRPCService}`,
                grpc.credentials.createInsecure(),
                {"grpc.service_config": `{"loadBalancingConfig":[{"round_robin": {}}]}`}
            ); */

                obj = {
                    id: '',
                    action:'delete',
                    poolCapacity: {}
                };
                obj.poolCapacity = arg;
                obj.id = arg.id;
                return creteMetadata(key, obj, arg, client);
    }
}
async function creteMetadata(key, obj, arg, client) {
    var request;
    var encKey;
    if (key == 'ReadAll') {
        encKey = 'resourcePoolReadAll';
        request = arg;
    } else {
        request = obj;
        encKey = key + request.length;
    }

    var user = {
        id: encKey,
        user: 'resourcePool'
    };
    //JWT token generator
    const jwt = await jwtTokenGenerator();
    const token = jwt.access_token;
    var tbearer = 'Bearer' + ' ' + token;
    // If metadata Doesn't have an Authorization key, then create a new one. Else update value to the new one.
    if (meta.get('Authorization').length === 0) {
        meta.add('Authorization', tbearer);
    } else {
        meta.set('Authorization', tbearer);
    }

    var mresponse = callMethod(key, request, meta, client);
    return mresponse;
}

function callMethod(key, request, meta, client) {
    // Based on the method we doing respect operation
    switch (key) {
        case 'ReadAll':
            return getReadAll(request, meta, client);
        case 'ReadById':
            return readById(request, meta, client);
        case 'Create':
            return create(request, meta, client);
        case 'Update':
            return update(request, meta, client);
        case 'Delete':
            return deleteMethod(request, meta, client);
        case 'Patch':
            return patch(request, meta, client);
    }
}

function getReadAll(request, meta, client) {
    // Get current time
    var t0 = new Date();

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            logger.applog('debug', t0, 'before');

            client.ReadAll(
                request,
                meta,
                function (error, logicalResources) {
                    if (error) {
                        logger.applog(
                            'error',
                            t0,
                            'Error in ReadAll method ',
                            JSON.stringify(error)
                        );
                        reject(error);
                    } else {
                        resolve(logicalResources);
                    }
                }
            );
        }, 10);
    });
}

function readById(request, meta, client) {
    // Get current time
    var t0 = new Date();

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            client.ReadById(request, meta, (error, response) => {
                if (!error) {
                    resolve(response);
                } else {
                    logger.applog(
                        'error',
                        t0,
                        'Error in ReadById method ',
                        JSON.stringify(error)
                    );
                    reject(error);
                }
            });
        }, 10);
    });
}

function deleteMethod(request, meta, client) {
    // Get current time
    var t0 = new Date();

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            client.Delete(request, meta, (error, response) => {
                if (!error) {
                    resolve(response);
                } else {
                    logger.applog(
                        'error',
                        t0,
                        'Error in Delete method ',
                        JSON.stringify(error)
                    );
                    reject(error);
                }
            });
        }, 10);
    });
}

function create(request, meta, client) {
    // Get current time
    var t0 = new Date();

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            client.Create(request, meta, (error, response) => {
                if (!error) {
                    logger.applog(
                        'info',
                        'Resource created resource by Id successfully ',
                        JSON.stringify(response)
                    );
                    resolve(response);
                } else {
                    logger.applog(
                        'error',
                        t0,
                        'Error in Create method ',
                        JSON.stringify(error)
                    );
                    reject(error);
                }
            });
        }, 10);
    });
}

function update(request, meta, client) {
    // Get current time
    var t0 = new Date();

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            client.Update(request, meta, (error, response) => {
                if (!error) {
                    resolve(response);
                } else {
                    logger.applog(
                        'error',
                        t0,
                        'Error in Update method ',
                        JSON.stringify(error)
                    );
                    reject(error);
                }
            });
        }, 10);
    });
}

function patch(request, meta, client) {
    // Get current time
    var t0 = new Date();
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            //var test= { 'logicalResource': { 'id': '5f5f6cb4008ed63bfc8bdaf0', 'resourceStatus': 'completed' } };
            client.Patch(request, meta, (error, response) => {
                if (!error) {
                    resolve(response);
                } else {
                    logger.applog(
                        'error',
                        t0,
                        'Error in Patch method ',
                        JSON.stringify(error)
                    );
                    reject(error);
                }
            });
        }, 10);
    });
}

function closeClient() {
    grpc.closeClient(client);
}

module.exports = {
    clientdata,
    closeClient
};
