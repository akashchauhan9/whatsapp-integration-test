const axios = require('axios');


const doPostRequest = async (url, payload, headers) => {
    try {
        const res = await axios.post(url, payload, headers);
        return res.data;
    } catch (error) {
        return error;
    }
}


const doGetRequest = async (url, payload) => {
    try {
        const res = await axios.get(url, payload);
        return res.data;
    } catch (error) {
        return error;
    }
}

module.exports = {
    doPostRequest,
    doGetRequest
}