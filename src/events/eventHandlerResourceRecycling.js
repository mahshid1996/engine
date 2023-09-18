const logger = require('../libs/logger.js');
const { APICall } = require('../libs/httpconnector.js');
const config = require('config');
const { clientdata } = require('../client/grpc.client.js');
const {configAddress} = require('../../src/service/address.js');

// API call to policy
async function resourcePolicyCall(
    message,
    policyName,
    tenantID,
    categoryCode,
    resourceStatus,
    operationalState,
    businessType,
    typeOfModel,
    blockResource
) {
    try {
        const time = new Date();
        logger.applog(
            'info',
            time,
            `categoryCode is: ${categoryCode}, resourceStatus is: ${resourceStatus}, operationalState is: ${operationalState}, businessType is: ${businessType}`
        );

        const url = `${config.camunda.url}/engine-rest/decision-definition/key/${policyName}/tenant-id/${tenantID}/evaluate`;
        const method = 'post';

        const data = {
            variables: {
                categoryCode: { value: categoryCode, type: 'String' },
                resourceStatus: { value: resourceStatus, type: 'String' },
                operationalState: { value: operationalState, type: 'String' },
                businessType: { value: businessType, type: 'String' }
            }
        };

        logger.applog('info', time, `Sending request to Camunda policy API at ${url} with data: ${JSON.stringify(data)}.`);

        const res = await APICall(url, method, data, { 'Content-Type': 'application/json' });

        logger.applog('info', time, `Response from Policy - ${policyName}: ${url} --> ${JSON.stringify(res.data)}`);

        if (res.data !== undefined && res.data.length > 0) {
            const resourceData = res.data[0];

            if (resourceData.resourceStatus && resourceData.operationalState && resourceData.duration) {
                const finalDuration = calculateDuration(resourceData.duration.value, resourceData.unit.value);
                logger.applog('info', time, `Duration after calculating is: ${JSON.stringify(finalDuration)}`);

                const output = await updateResourceRecycleDate(message, typeOfModel, finalDuration);
                await configAddress(output.logicalResource);
            } else {
                logger.applog(
                    'error',
                    time,
                    'Please ensure that the requirement output has been prepared in the Camunda policy. Please check values of "resourceStatus", "operationalState", and "duration".'
                );
            }
        } else {
            logger.applog('info', time, 'Camunda policy response is empty or did not provide a response.');
        }

        return res.data;
    } catch (err) {
        const time = new Date();
        logger.applog('error', time, `Error while making Policy Call: ${err.message}`);
    }
}

// Updating resourceRecycleDate field
async function updateResourceRecycleDate(item, typeOfModel, finalDuration) {
    try {
        const time = new Date();
        const ip = config.inventory.gRPCService;
        logger.applog('info', time, `Updating resourceRecycleDate field ${item.id}`);

        if (item.resourceRecycleDate === undefined) {
            Object.assign(item, { resourceRecycleDate: finalDuration });
        } else {
            item.resourceRecycleDate = finalDuration;
        }

        const query = { id: item.id, resourceRecycleDate: item.resourceRecycleDate };

        let output = {};

        if (typeOfModel === 'logicalResourcePatchEvent') {
            logger.applog('info', time, 'resourceRecycleDate field is updated');
            output = await clientdata('Patch', query, 'logical', ip);
        } else {
            logger.applog('info', time, 'resourceRecycleDate field is updated');
            output = await clientdata('Patch', query, 'physical', ip);
        }

        return output;
    } catch (err) {
        const time = new Date();
        logger.applog('error', time, `Error while updating "resourceRecycleDate" of resource: ${err.message}`);
    }
}

// Specifying duration based on type (type can be 'Year', 'Month', 'Week', 'Day', 'Hour', 'Minute')
function calculateDuration(duration, unit) {
    try {
        const time = new Date();
        let currentDate = new Date();
        let futureDate;

        logger.applog('info', time, 'Calculating the Duration field.');
        logger.applog(
            'info',
            time,
            `duration value in the camunda policy is: ${duration} and unit of the duration in the camunda policy is: ${unit}`
        );

        switch (unit) {
            case 'Year':
                futureDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + duration));
                break;
            case 'Month':
                futureDate = new Date(currentDate.setMonth(currentDate.getMonth() + duration));
                break;
            case 'Week':
                futureDate = new Date(currentDate.setDate(currentDate.getDate() + duration * 7));
                break;
            case 'Hour':
                futureDate = new Date(currentDate.getTime() + duration * 60 * 60 * 1000);
                break;
            case 'Minute':
                futureDate = new Date(currentDate.getTime() + duration * 60000);
                break;
            default:
                futureDate = new Date(currentDate.setDate(currentDate.getDate() + duration));
        }

        logger.applog('info', time, 'Duration updated based on durationType.');
        return futureDate;
    } catch (err) {
        const time = new Date();
        logger.applog('error', time, `Error while calculating duration: ${err.message}`);
    }
}

module.exports = {
    resourcePolicyCall,
    updateResourceRecycleDate,
    calculateDuration
};
