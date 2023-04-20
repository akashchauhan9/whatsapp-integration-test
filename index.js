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
        "step": 0,
        "lang": 0
    },
    {
        "name": "Akash",
        "mobile": "919582615259",
        "step": 0,
        "lang": 0
    }
];

const userForm = []

const langForm = [
    {
        "Q": "Choose Language. 1 For English, 2 For हिंदी"
    }
]
const enFormData = [
    {
        "Q": "What is your name"
    },
    {
        "Q": "What is your DOB"
    },
    {
        "Q": "What is your roll number"
    },
    {
        "Q": "What is your qualification"
    }
]

const hiFormData = [
    {
        "Q": "आपका क्या नाम है"
    },
    {
        "Q": "आपका DOB क्या है"
    },
    {
        "Q": "आपका रोल नंबर क्या है"
    },
    {
        "Q": "आपकी उच्च योग्यता क्या है"
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
            if ((body.entry) &&
                (body.entry[0].changes) &&
                (body.entry[0].changes[0].value.messages) &&
                (body.entry[0].changes[0].value.messages[0])) {

                const phoneNoId = body.entry[0].changes[0].value.metadata.phone_number_id;
                const from = body.entry[0].changes[0].value.messages[0].from;
                const msgBody = body.entry[0].changes[0].value.messages[0].text.body;
                // const userExist = await User.findOne({phone: from});
                let userExist = user.find(el => el.mobile === from);

                // // let user;
                if (!userExist) {
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
                            body: 'Welcome to JaKeGa. To initiate the chat. Say, Hi!!'
                        }
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                };
                if (userExist.step > enFormData.length) {
                    axiosObj.data.text.body = "Thankyou for submitting the form."
                }
                else if (userExist.step > 0) {
                    console.log("🚀 ~ file: index.js:161 ~ app.post ~ userExist.step:", userExist.step)

                    let userFormExist = userForm.find(el => el?.mobile === from);
                    if (userExist.lang > 0) {
                        let question;
                        question = userExist.lang === 1 ? enFormData[userExist.step - 1].Q : hiFormData[userExist.step - 1].Q;
                        axiosObj.data.text.body = question;

                        userExist = user.find(el => el.mobile === from);
                        if (userFormExist) {
                            const userFormIndex = userForm.indexOf(userFormExist);
                            userForm[userFormIndex].questionAnswer.push({
                                [`Q${userExist.step}`]: userExist.lang === 1 ? enFormData[userExist.step - 1].Q : hiFormData[userExist.step - 1].Q,
                                [`A${userExist.step}`]: msgBody
                            })
                        }
                        else {
                            userForm.push(
                                {
                                    mobile: from,
                                    questionAnswer: [
                                        {
                                            [`Q${userExist.step}`]: userExist.lang === 1 ? enFormData[userExist.step - 1].Q : hiFormData[userExist.step - 1].Q,
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
                    else if (msgBody === '1' || msgBody === '2') {
                        userExist = user.find(el => el.mobile === from);
                        const index = user.indexOf(userExist);
                        userExist = {
                            name: body.entry[0].changes[0].value.contacts[0].profile.name,
                            mobile: from,
                            step: userExist.step,
                            lang: msgBody
                        };
                        user.splice(index, 1);
                        user.push(userExist);
                        if (userFormExist) {
                            const userFormIndex = userForm.indexOf(userFormExist);
                            userForm[userFormIndex].questionAnswer.push({
                                [`Q${userExist.step}`]: userExist.lang === 1 ? enFormData[userExist.step - 1].Q : hiFormData[userExist.step - 1].Q,
                                [`A${userExist.step}`]: msgBody
                            })
                        }
                        else {
                            userForm.push(
                                {
                                    mobile: from,
                                    questionAnswer: [
                                        {
                                            [`Q${userExist.step}`]: userExist.lang === 1 ? enFormData[userExist.step - 1].Q : hiFormData[userExist.step - 1].Q,
                                            [`A${userExist.step}`]: msgBody
                                        }
                                    ]
                                }
                            )
                        }
                    }
                    else {
                        axiosObj.data.text.body = 'Please choose correct option.'
                    }
                }
                else if (msgBody === 'Hi') {
                    console.log("🚀 ~ file: index.js:149 ~ app.post ~ msgBody:", msgBody)
                    const index = user.indexOf(userExist)
                    // let userFormExist = userForm.find(el => el?.mobile === from);
                    let question;
                    question = langForm[0].Q;
                    axiosObj.data.text.body = question;

                    userExist = {
                        name: body.entry[0].changes[0].value.contacts[0].profile.name,
                        mobile: from,
                        step: 1,
                        lang: 0
                    };
                    user.splice(index, 1);
                    user.push(userExist);
                    userExist = user.find(el => el.mobile === from);
                }
                const apiCall = await axios(axiosObj)
                return res.status(200).json({ success: true })
            }
            else {
                return res.status(400).json({ success: false })
            }
        } else {
            return res.status(400).json({ success: false })
        }
    } catch (error) {
        return res.status(500).json({ success: false })
    }
});


exports.app = functions.https.onRequest(app);