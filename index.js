const functions = require('firebase-functions');

const express = require('express');
const bodyParser = require('body-parser');
const { doPostRequest } = require('./axiosApiCall');
const { default: axios } = require('axios');
const app = express().use(bodyParser.json());
require('dotenv')
const token = process.env.TOKEN;
const myToken = process.env.MY_TOKEN;

app.listen(8000 || process.env.PORT, () => {
    console.log('Webhook is listening');
})

app.get('/', (req, res) => { res.status(200).json({ 'message': 'OK' }) });

app.get('/webhook', async (req, res) => {
    try {
        console.log("🚀 ~ file: index.js:19 ~ app.get ~ req:", req)

        const mode = req.query['hub.mode'];
        console.log("🚀 ~ file: index.js:21 ~ app.get ~ mode:", mode)
        const challenge = req.query['hub.challenge'];
        console.log("🚀 ~ file: index.js:23 ~ app.get ~ challenge:", challenge)
        const token = req.query['hub.verify_token'];
        console.log("🚀 ~ file: index.js:25 ~ app.get ~ token:", token)

        if (mode && token) {
            console.log("🚀 ~ file: index.js:28 ~ app.get ~ mode && token:", mode && token)
            if (mode === 'subscribe' && token === myToken) {
                res.status(200).send(challenge)
            }
            else {
                res.status(403)
            }
        }
    } catch (error) {
        return res.status(500).json({ error })
    }
});

app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;
        console.log("🚀 ~ file: index.js:45 ~ app.post ~ body:", JSON.stringify(body))

        if (body.object) {
            console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes:", body.entry[0].changes)
            console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes[0].value.messages:", body.entry[0].changes[0].value.messages)
            console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes[0].value.messages[0]:", body.entry[0].changes[0].value.messages[0])
            if (body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]) {

                const phoneNoId = body.entry[0].changes[0].value.metadata.phone_number_id;
                console.log("🚀 ~ file: index.js:54 ~ app.post ~ phoneNoId:", phoneNoId)
                const from = body.entry[0].changes[0].value.messages[0].from;
                console.log("🚀 ~ file: index.js:56 ~ app.post ~ from:", from)
                const msgBody = body.entry[0].changes[0].value.messages[0].text.body;
                console.log("🚀 ~ file: index.js:58 ~ app.post ~ msgBody:", msgBody)

                if(msgBody === 'Hi' || msgBody === 'Test') {
                    // const url = 'https://graph.facebook.com/v16.0/' + phoneNoId + '/messages?access_token=' + token;
                    // const payload = {
                    //     messaging_product: 'whatsapp',
                    //     to: from,
                    //     text: {
                    //         body: "Hello from Akash"
                    //     }
                    // };
                    // const headers = {
                    //     'Content-Type': 'application/json'
                    // };
                    // console.log("🚀 ~ file: index.js:69 ~ app.post ~ url, payload, headers:", url, payload, headers)
                    const axiosObj = {
                        method: 'POST',
                        url: 'https://graph.facebook.com/v16.0/' + phoneNoId + '/messages',
                        data: {
                            messaging_product: 'whatsapp',
                            to: from,
                            text: {
                                body: msgBody
                            }
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token 
                        }
                    };
                    console.log("🚀 ~ file: index.js:92 ~ app.post ~ axiosObj:", axiosObj)
    
                    // const apiCall = await doPostRequest(url, payload, headers);
                    const apiCall = await axios(axiosObj)
                    console.log("🚀 ~ file: index.js:77 ~ app.post ~ apiCall:", apiCall)
                    return res.status(200).send(apiCall)
                }
                else {
                    console.log("🚀 ~ file: index.js:78 ~ app.post ~ fail:")
                    return res.status(400).send('fail')
                }
            }
            else {
                return res.status(403).json({ success: false })
            }
        } else {
            res.status(403).json({ success: false })
        }
    } catch (error) {
        return res.status(500).json({ error })
    }
});

exports.app = functions.https.onRequest(app);