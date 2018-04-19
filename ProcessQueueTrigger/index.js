var request = require('request');

// using west europe for GDPR compliance
const VISION_API_ENDPOINT = 'https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze';
const VISION_API_KEY = '<ToDo: your vision API key here>';

// ToDo: Dynamically create a SAS key for the VISION API to access the private image store
const SAS_KEY = "<your sas key here>";
const blobUrl = "https://<ToDo: your storage account here>.blob.core.windows.net/private/"
// ######################


/**
 * Analyze the image with Microsoft Cognitive Services Vision API.
 * 
 * @param {string} imageName The image name (in the blog, i.e. "Profile.JPG") of the uploaded image.
 * @param {context} context for logging in the Function app
 * @param {function} callback The callback function the handle the response of Microsoft Cognitive Services API.
 */
function analyzeImage(imageName, context, callback) {
    var imageUrl = blobUrl + imageName + SAS_KEY;
    var reqBody = {};
    reqBody.url = imageUrl;
    context.log(imageUrl);
    var postOpt = {
        url: VISION_API_ENDPOINT + "?visualFeatures=adult,tags",
        body: JSON.stringify(reqBody),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': VISION_API_KEY
        }
    };

    request(postOpt, callback);
}

module.exports = function (context, myQueueItem) {

    var message;
    if (typeof myQueueItem === 'string') {
        context.log('Trigger was a string! - ' + myQueueItem);
        message = JSON.parse(myQueueItem);
    } else if (typeof myQueueItem === 'object') {
        context.log('Trigger was an object! - \n' + JSON.stringify(myQueueItem, null, ' '));
        message = myQueueItem;
    }

analyzeImage(message.image, context, function(error, response, body){
        if (error === null) {
            var result = JSON.parse(body);

            if(result != undefined){
                context.log("SUCCESS");
                var tags = {};
                if(result.tags != undefined && result.tags.length > 0){
                    context.log(result.tags);
                    tags = result.tags;
                }

                var adult = {};
                if(result.adult != undefined){
                    context.log(result.adult);
                    adult = result.adult;
                }

                context.bindings.outputDocument = JSON.stringify({
                    id: message.image,
                    name: message.image,
                    tags : tags,
                    adult : adult
                });
                context.log("Outputting:\n");
                context.log(context.bindings.outputDocument);
            }
        }
        else
        {
            context.log(error);
        }
        context.done();
    });

};