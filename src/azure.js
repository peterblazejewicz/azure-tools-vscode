var msRestAzure = require('ms-rest-azure');
var WebSiteManagement = require('azure-arm-website');
var ResourceManagement = require('azure-arm-resource');
var azure = require('azure');
var config = require('./config');
var constants = config.getConstants();

exports.createWebApp = function createWebApp(state) {
    return new Promise(function (resolve, reject) {
        var webSiteManagement = new WebSiteManagement(state.credentials, state.selectedSubscriptionId);
        webSiteManagement.sites.createOrUpdateSite(state.resourceGroupToUse,
            state.newWebAppName,
            {
                location: state.selectedRegion,
                serverFarmId: state.selectedServerFarm
            },
            function (err, result) {
                if (err != null) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
    });
};

exports.createNewResourceGroup = function createNewResourceGroup(state) {
    return new Promise(function (resolve, reject) {
        var resourceClient = new ResourceManagement.ResourceManagementClient(state.credentials, state.selectedSubscriptionId);
        resourceClient.resourceGroups.createOrUpdate(state.resourceGroupToUse, {
            location: state.selectedRegion // todo: enable user selection
        }, function (err, result) {
            if (err != null) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};

exports.createNewServerFarm = function createNewServerFarm(state) {
    return new Promise(function (resolve, reject) {
        var webSiteManagement = new WebSiteManagement(state.credentials, state.selectedSubscriptionId);
        var planParameters = {
            serverFarmWithRichSkuName: state.selectedServerFarm,
            location: state.selectedRegion,
            sku: {
                name: 'F1',
                capacity: 1,
                tier: 'Free'
            }
        };
        webSiteManagement.serverFarms.createOrUpdateServerFarm(
            state.resourceGroupToUse,
            state.selectedServerFarm,
            planParameters,
            function (err, result) {
                if (err != null)
                    reject(err);
                else {
                    resolve(result);
                }
            }
        );
    });
};

exports.getServerFarms = function getServerFarms(state) {
    return new Promise(function (resolve, reject) {
        var resourceClient = new ResourceManagement.ResourceManagementClient(state.credentials, state.selectedSubscriptionId);
        resourceClient.resources.list({
            filter: "resourceType eq 'Microsoft.Web/serverfarms' and resourceGroup eq '" + state.resourceGroupToUse + "'"
        }, function (err, result) {
            if (err != null)
                reject(err);
            else {
                resolve(result);
            }
        });
    });
};

exports.getResourceGroups = function getResourceGroups(state) {
    return new Promise(function (resolve, reject) {
        var resourceClient = new ResourceManagement.ResourceManagementClient(state.credentials, state.selectedSubscriptionId);
        state.resourceGroupList = [];
        resourceClient.resourceGroups.list(function (err, result) {
            if (err != null)
                reject(err);
            else {
                resolve(result);
            }
        })
    });
};

exports.checkSiteNameAvailability = function checkSiteNameAvailability(state) {
    return new Promise(function (resolve, reject) {
        var webSiteManagement = new WebSiteManagement(state.credentials, state.selectedSubscriptionId);
        webSiteManagement.global.checkNameAvailability({
            name: state.newWebAppName,
            type: 'Microsoft.Web/sites'
        }, function (err, result) {
            if (err != null)
                reject(err);
            else {
                resolve(result);
            }
        });
    });
};

exports.getFullResourceList = function getFullResourceList(state) {
    return new Promise(function (resolve, reject) {
        var resourceClient = new ResourceManagement.ResourceManagementClient(state.credentials, state.selectedSubscriptionId);
        resourceClient.resources.list(function (err, result) {
            if (err != null)
                reject(err);
            else {
                state.entireResourceList = result;
                names = state.entireResourceList.map(function (resource) {
                    return resource.id.replace('subscriptions/' + state.selectedSubscriptionId + '/resourceGroups/', '');
                });
                resolve(names);
            }
        });
    });
};

exports.getRegions = function getRegions(state) {
    return new Promise(function (resolve, reject) {
        var resourceClient = new ResourceManagement.ResourceManagementClient(state.credentials, state.selectedSubscriptionId);
        var subscriptionClient = azure.createARMSubscriptionManagementClient(state.credentials);
        subscriptionClient.subscriptions.listLocations(state.selectedSubscriptionId, function (err, result) {
            if (err != null)
                reject(err);
            else {
                resolve(result);
            }
        });
    });
};