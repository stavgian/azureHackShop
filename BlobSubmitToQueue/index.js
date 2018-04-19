const azure = require('azure-storage');

module.exports = function (context, myBlob) {
    context.log("JavaScript blob trigger function processed blob \n Name:", context.bindingData.name, "\n");
    var response = {};
    response.image = context.bindingData.name;
    context.log(JSON.stringify(response));
    context.bindings.outputQueueItem = response;
    context.done();
};