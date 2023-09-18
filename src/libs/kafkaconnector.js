const { Kafka, logLevel } = require( 'kafkajs');
const config = require('config');
const { resourcePolicyCall } = require( '../events/eventHandlerResourceRecycling.js');
const logger = require('../libs/logger.js');
const { clientdata } = require( '../client/grpc.client.js');
const { outFileAddress } = require( '../service/outFile/outFileAddress.js');


// KafkaJS logLevel -> Winston logLevel
const toLogLevel = (level) => {
    switch (level) {
        case logLevel.ERROR:
        case logLevel.NOTHING:
            return 'error';
        case logLevel.WARN:
            return 'warn';
        case logLevel.INFO:
            return 'info';
        case logLevel.DEBUG:
            return 'debug';
    }
};

// Custom Log Creator for KafkaJS
const customLogCreator = (logLevel) => {
    // Get current date time
    let time = new Date();

    return ({ log }) => {
        let message = '';

        if (log.error == undefined) {
            message =
                'Kafka' +
                ' - ' +
                log.message +
                ', groupId: ' +
                log.groupId;
            logger.applog(toLogLevel(logLevel), time, message);
        } else {
            message = 'Kafka' + ' - ' + log.error;
            logger.applog(toLogLevel(logLevel), time, message);
        }
    };
};

// Configure Kafka Brokers
const kafka = new Kafka({
    brokers: String(config.kafka.brokers).split(','),
    logLevel: logLevel.INFO,
    logCreator: customLogCreator
});

// Initialize Kafka Producer
const producer = kafka.producer();
// Initialize Kafka Consumer
const consumer = kafka.consumer({
    groupId: config.kafka.groupId
});
// Initialize Kafka Admin
const admin = kafka.admin();
// Get kafka topics from config
const topics = String(config.kafka.topics).split(',');

// Produce Messages
const produceMessage = async (producer, topic, key, message) => {
    await producer.send({
        topic: topic,
        messages: [
            {
                key: key,
                value: message
            }
        ]
    });
};

// Producer
const produce = async (topic, key, message) => {
    // Get current date time
    let time = new Date();

    try {
        await producer.connect();
    } catch (err) {
        logger.applog(
            'error',
            time,
            'Could not connect to kafka producer'
        );
    }

    createTopics(topics);
    produceMessage(producer, topic, key, message);
};

// Consumer
const consume = async (app) => {
    // Get current date time
    let time = new Date();

    try {
        await consumer.connect();
    } catch (err) {
        logger.applog(
            'error',
            time,
            'Could not connect to kafka consumer'
        );
    }

    topics.forEach((topic) => {
        consumer.subscribe({
            topic,
            fromBeginning: true
        });
    });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            logger.applog(
                'info',
                time,
                'Received kafka event: ' + message.value.toString()
            );
            const event = JSON.parse(message.value.toString());
        
            let resourceType, eventDetails;
   
            var resource = event.eventType.split('Resource');
            resourceType = resource[0] + 'Resource';
            eventDetails = event.event[resourceType];
    
            switch (topic) {
                case 'logicalResourcePatchEvent':
                    if (event && event.event && event.event.logicalResource && event.event.logicalResource.resourceRecycleDate == null) {
                    try {
                        //getting category
                        var records = await clientdata(
                            'ReadById',
                            {
                                "id": event.event.logicalResource.category[0]
                              },
                            'resourcecategory',
                            config.inventory.gRPCService
                        );
                        logger.applog(
                            'debug',
                            time,
                            `Category data before calling policy for updating RecycleDate: ${JSON.stringify(records)}.`
                        );
                        //checking value of categoryCode for assigning value to resourceRecycleDate
                        resourcePolicyCall(
                            eventDetails,
                            'drmRecycleFlowPolicy',
                            config.camunda.engineTenant,
                            records.resourceCategory.code,
                            eventDetails['resourceStatus'],
                            eventDetails['operationalState'],
                            eventDetails.businessType[0],
                            topic,
                            true
                        );
                      } catch (error) {
                        // handle the error here
                        logger.applog(
                          'error',
                          time,
                          `Error occurred while fetching data from 'resourcecategory' api with id ${event.event.logicalResource.category[0]}: ${error.message}`
                        );
                      }
                   }
                case 'physicalResourcePatchEvent':
                    outFileAddress(event.event.physicalResource,event.fileName);
                    break;
            }

        }
    });
};

// Create Kafka topics
const createTopics = async (topics) => {
    // Get current date time
    let time = new Date();

    try {
        await admin.connect();
    } catch (err) {
        logger.applog('error', time, 'Could not connect to kafka admin');
    }

    const listTopics = await admin.listTopics();

    for (let i = 0; i < topics.length; ++i) {
        if (!listTopics.includes(topics[i])) {
            try {
                await admin.createTopics({
                    topics: [
                        {
                            topic: topics[i]
                        }
                    ]
                });
            } catch (error) {
                logger.applog(
                    'error',
                    time,
                    'Could not create kafka topic: ' + topics[i]
                );
            }
        }
    }
};


module.exports = {
    createTopics,
    consume,
    produce,
    produceMessage
  };
