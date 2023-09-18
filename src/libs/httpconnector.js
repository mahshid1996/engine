const axios = require('axios');
const https = require('https');

const APICall = (url, method, body,headerdata) => {
    
    return axios({
        method: method,
        url: url,
        data: body,
        headers: headerdata,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    }).then((resp) => {
        
        return resp;
    }).catch((error) => {
        return error;
    });
}


module.exports = {
    APICall
  };


