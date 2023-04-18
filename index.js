const functions = require('firebase-functions');

const express = require('express');
const bodyParser = require('body-parser');
const { doPostRequest } = require('./axiosApiCall');
const app = express().use(bodyParser.json());
require('dotenv')
const token = process.env.TOKEN;
const myToken = process.env.MY_TOKEN;

app.listen(8000 || process.env.PORT, () => {
    console.log('Webhook is listening');
})

app.get('/webhook', async (req, res) => {
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const token = req.query['hub.verify_token'];

    if (mode && token) {
        if (mode === 'subscribe' && token === myToken) {
            res.status(200).send(challenge)
        }
        else {
            res.status(403)
        }
    }
});

app.post('/webhook', async (req, res) => {
    const body = req.body;
    console.log(JSON.stringify(body, null, 2))

    if (body.object) {
        if (body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.message &&
            body.entry[0].changes[0].value.message[0]) {

            const phoneNoId = body.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body.entry[0].changes[0].value.message[0].from;
            const msgBody = body.entry[0].changes[0].value.message[0].text.body;

            const url = 'https://graph.facebook.com/v16.0' + phoneNoId + '/message?access_token=' + token;
            const payload = {
                messaging_product: 'whatsapp',
                to: from,
                text: {
                    body: 'Hello World Boi'
                }
            };
            const headers = {
                'Content-Type': 'application/json'
            };
            const apiCall = await doPostRequest(url, payload, headers);
            res.status(200).send(apiCall)
        }
        else {
            res.status(403)
        }
    }
});

exports.app = functions.https.onRequest(app);