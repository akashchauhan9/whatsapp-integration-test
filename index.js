const functions = require('firebase-functions');

const express = require('express');
const bodyParser = require('body-parser');
const { doPostRequest } = require('./app/utils/axiosApiCall');
const { default: axios } = require('axios');
const app = express().use(bodyParser.json());
const { env } = require('./app/constants/environment');
// const User = require('./app/models/userModel');

const token = env.token;
const myToken = env.myToken;

app.listen(8080 || env.PORT, () => {
    console.log('Webhook is listening on', env.PORT);
})

const user = [
    {
        "name": "Avnish",
        "mobile": "77858585895959",
        "step": 1
    },
    {
        "name": "Akash",
        "mobile": "9582615259",
        "step": 1
    }
];

const userForm = []

const formData = [
    {
        "Q": "Whats your name",
    },
    {
        "Q": "Whats your DOB",
    },
    {
        "Q": "Whats your roll",
        "ANS": {
            "1": "User",
            "2": "Admin"
        }
    },
    {
        "Q": "Whats your qualification",
        "ANS": {
            "1": "10",
            "2": "12",
            "3": "Diploma",
            "4": "Under Graduate"
        }
    }
]

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
            // console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes:", body.entry[0].changes)
            // console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes[0].value.messages:", body.entry[0].changes[0].value.messages)
            // console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes[0].value.messages[0]:", body.entry[0].changes[0].value.messages[0])
            if ((body.entry) &&
                (body.entry[0].changes) &&
                (body.entry[0].changes[0].value.messages) &&
                (body.entry[0].changes[0].value.messages[0])) {

                const phoneNoId = body.entry[0].changes[0].value.metadata.phone_number_id;
                console.log("🚀 ~ file: index.js:54 ~ app.post ~ phoneNoId:", phoneNoId)
                const from = body.entry[0].changes[0].value.messages[0].from;
                console.log("🚀 ~ file: index.js:56 ~ app.post ~ from:", from)
                const msgBody = body.entry[0].changes[0].value.messages[0].text.body;
                console.log("🚀 ~ file: index.js:58 ~ app.post ~ msgBody:", msgBody)
                // const userExist = await User.findOne({phone: from});
                let userExist = user.find(el => el.mobile === from);

                // // let user;
                if(!userExist) {
                    // user = new User(user);
                    // user = await user.save()
                    userExist = {
                        name: body.entry[0].changes[0].value.contacts[0].profile.name,
                        mobile: from,
                        step: 1
                    };
                    user.push(userExist);
                    console.log("🚀 ~ file: index.js:120 ~ app.post ~ user:", user)
                    userExist = user.find(el => el.mobile === from);
                }
                const axiosObj = {
                    method: 'POST',
                    url: 'https://graph.facebook.com/v16.0/' + phoneNoId + '/messages',
                    data: {
                        messaging_product: 'whatsapp',
                        to: from,
                        text: {
                            body: 'This text is from Service Plus. To initiate the chat. Say, Hi!!'
                        }
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token 
                    }
                };
                if(userExist.step >= formData.length) {
                    axiosObj.data.text.body = "Thankyou for submitting the form."
                }
                else if(userExist.step>1) {
                    console.log("🚀 ~ file: index.js:161 ~ app.post ~ userExist.step:", userExist.step)
                    let userFormExist = userForm.find(el => el?.mobile === from);
                    let question;
                    question = formData[userExist.step-1].Q;
                    axiosObj.data.text.body = question;

                    userExist = user.find(el => el.mobile === from);
                    if(userFormExist) {
                        const userFormIndex = userForm.indexOf(userFormExist);
                        userForm[userFormIndex].questionAnswer.push({
                            [`Q${userExist.step}`]: formData[userExist.step-1].Q,
                            [`A${userExist.step}`]: msgBody
                        })
                    }
                    else {
                        userForm.push(
                            {
                                mobile: from,
                                questionAnswer: [
                                    {
                                        [`Q${userExist.step}`]: formData[userExist.step-1].Q,
                                        [`A${userExist.step}`]: msgBody
                                    }
                                ]
                            }
                        )
                    }
                    const index = user.indexOf(userExist);
                    userExist = {
                        name: body.entry[0].changes[0].value.contacts[0].profile.name,
                        mobile: from,
                        step: userExist.step + 1
                    };
                    user.splice(index, 1);
                    user.push(userExist);
                }
                else if(msgBody === 'Hi' || msgBody === 'Test') {
                    console.log("🚀 ~ file: index.js:149 ~ app.post ~ msgBody:", msgBody)
                    const index = user.indexOf(userExist)
                    let userFormExist = userForm.find(el => el?.mobile === from);
                    let question;
                    question = formData[userExist.step-1].Q;
                    axiosObj.data.text.body = question;
                    if(userFormExist) {
                        const userFormIndex = userForm.indexOf(userFormExist);
                        userForm[userFormIndex].questionAnswer.push({
                            [`Q${userExist.step}`]: formData[userExist.step-1].Q,
                            [`A${userExist.step}`]: msgBody
                        })
                    }
                    else {
                        userForm.push(
                            {
                                mobile: from,
                                questionAnswer: [
                                    {
                                        [`Q${userExist.step}`]: formData[userExist.step-1].Q,
                                        [`A${userExist.step}`]: msgBody
                                    }
                                ]
                            }
                        )
                    }
                    userExist = {
                        name: body.entry[0].changes[0].value.contacts[0].profile.name,
                        mobile: from,
                        step: 2
                    };
                    user.splice(index, 1);
                    user.push(userExist);
                    userExist = user.find(el => el.mobile === from);
                }
                console.log("🚀 ~ file: index.js:172 ~ app.post ~ userForm:", user)

                console.log("🚀 ~ file: index.js:173 ~ app.post ~ userForm:", userForm)
                console.log("🚀 ~ file: index.js:92 ~ app.post ~ axiosObj:", axiosObj)
                const apiCall = await axios(axiosObj)
                console.log("🚀 ~ file: index.js:84 ~ app.post ~ apiCall:", apiCall)
                return res.status(200).json({ success: true })
            }
            else {
                console.log("🚀 ~ file: index.js:82 ~ app.post ~ out fail:", JSON.stringify(body))
                return res.status(400).json({ success: false })
            }
        } else {
            console.log("🚀 ~ file: index.js:85 ~ app.post ~ out fail:")
            return res.status(400).json({ success: false })
        }
    } catch (error) {
        console.log("🚀 ~ file: index.js:99 ~ app.post ~ error:", error)
        return res.status(500).json({ success: false })
    }
});


exports.app = functions.https.onRequest(app);