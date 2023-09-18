const config = require('config');

let url = config.drmApi.url;

module.exports = {
    LogicalResource:
        url + '/drm/resource-inventory/v1/logical-resource',
    PhysicalResource:
        url + '/drm/resource-inventory/v1/physical-resource',
    CategorySchema:
        url + '/drm/resource-inventory/v1/category-schema/',
    ConfigService: url + '/drm/config-service/v1/master-config/'
};
