var IotApi = require('@arduino/arduino-iot-client');
var rp = require('request-promise');
const config = require('config');

async function getToken() {
    var options = {
        method: 'POST',
        url: 'https://api2.arduino.cc/iot/v1/clients/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        json: true,
        form: {
            grant_type: 'client_credentials',
            client_id: config.get('client_id'),
            client_secret: config.get('client_secret'),
            audience: 'https://api2.arduino.cc/iot'
        }
    };

    try {
        const response = await rp(options);
        return response['access_token'];
    }
    catch (error) {
        console.error("Failed getting an access token: " + error)
    }
}

async function run(id, pid, value) {
    var client = IotApi.ApiClient.instance;
    // Configure OAuth2 access token for authorization: oauth2
    var oauth2 = client.authentications['oauth2'];
    oauth2.accessToken = await getToken();

    var api = new IotApi.PropertiesV2Api()
    // var id = "70c06092-6084-476d-a573-23133001ecc3"; // {String} The id of the thing
    // var pid = "6ee29632-8270-44ae-9aea-f5ff9eaa5b7e"; // {String} The id of the property
    var property = {
        "value": value
    }; // {Property} 
    const result = new Promise ((res,rej) => {
        try {
            api.propertiesV2Publish(id, pid, property).then(async function() {
                res({
                    status: 200,
                    property: value,
                    message: 'API called successfully.'
                });
            })
            .catch(error => {
                return rej({
                    status: error.status,
                    property: value,
                    message: error.body.detail
                })
            })
        } catch(error) {
            console.log(error)
            return rej(error);
        }
    })
    
    return result;
}

module.exports = run;