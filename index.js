const functions = require('firebase-functions');

const express = require('express');
const bodyParser = require('body-parser');
const { doPostRequest } = require('./app/utils/axiosApiCall');
const { default: axios } = require('axios');
const app = express().use(bodyParser.json());
const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');
const { env } = require('./app/constants/environment');
// const User = require('./app/models/userModel');

const token = env.token;
const myToken = env.myToken;

app.listen(8080 || env.PORT, () => {
    console.log('Webhook is listening on', env.PORT);
})

const Whatsapp = new WhatsappCloudAPI({
    accessToken: env.Meta_WA_accessToken,
    senderPhoneNumberId: env.Meta_WA_SenderPhoneNumberId,
    WABA_ID: env.Meta_WA_wabaId,
});

const EcommerceStore = require('./app/utils/ecommerce_store');
let Store = new EcommerceStore();
const CustomerSession = new Map();

const user = [
    {
        "name": "Avnish",
        "mobile": "77858585895959",
        "step": 0
    },
    {
        "name": "Akash",
        "mobile": "9582615259",
        "step": 0
    }
];

const userForm = []

const formData = [
    {
        "Q": "Whats your name",
        "ANS": ""
    },
    {
        "Q": "Whats your DOB",
        "ANS": ""
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

// app.get('/webhook', async (req, res) => {
//     try {
//         console.log("🚀 ~ file: index.js:19 ~ app.get ~ req:", req)

//         const mode = req.query['hub.mode'];
//         console.log("🚀 ~ file: index.js:21 ~ app.get ~ mode:", mode)
//         const challenge = req.query['hub.challenge'];
//         console.log("🚀 ~ file: index.js:23 ~ app.get ~ challenge:", challenge)
//         const token = req.query['hub.verify_token'];
//         console.log("🚀 ~ file: index.js:25 ~ app.get ~ token:", token)

//         if (mode && token) {
//             console.log("🚀 ~ file: index.js:28 ~ app.get ~ mode && token:", mode && token)
//             if (mode === 'subscribe' && token === myToken) {
//                 res.status(200).send(challenge)
//             }
//             else {
//                 res.status(403)
//             }
//         }
//     } catch (error) {
//         return res.status(500).json({ error })
//     }
// });

// app.post('/webhook', async (req, res) => {
//     try {
//         const body = req.body;
//         console.log("🚀 ~ file: index.js:45 ~ app.post ~ body:", JSON.stringify(body))

//         if (body.object) {
//             // console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes:", body.entry[0].changes)
//             // console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes[0].value.messages:", body.entry[0].changes[0].value.messages)
//             // console.log("🚀 ~ file: index.js:52 ~ app.post ~ body.entry[0].changes[0].value.messages[0]:", body.entry[0].changes[0].value.messages[0])
//             if ((body.entry) &&
//                 (body.entry[0].changes) &&
//                 (body.entry[0].changes[0].value.messages) &&
//                 (body.entry[0].changes[0].value.messages[0])) {

//                 const phoneNoId = body.entry[0].changes[0].value.metadata.phone_number_id;
//                 console.log("🚀 ~ file: index.js:54 ~ app.post ~ phoneNoId:", phoneNoId)
//                 const from = body.entry[0].changes[0].value.messages[0].from;
//                 console.log("🚀 ~ file: index.js:56 ~ app.post ~ from:", from)
//                 const msgBody = body.entry[0].changes[0].value.messages[0].text.body;
//                 console.log("🚀 ~ file: index.js:58 ~ app.post ~ msgBody:", msgBody)
//                 // const userExist = await User.findOne({phone: from});
//                 let userExist = user.find(el => el.mobile === from);

//                 // // let user;
//                 if(!userExist) {
//                     // user = new User(user);
//                     // user = await user.save()
//                     userExist = {
//                         name: body.entry[0].changes[0].value.contacts[0].profile.name,
//                         mobile: from,
//                         step: 0
//                     };
//                     user.push(userExist);
//                     userExist = user.find(el => el.mobile === from);
//                 }
//                 const axiosObj = {
//                     method: 'POST',
//                     url: 'https://graph.facebook.com/v16.0/' + phoneNoId + '/messages',
//                     data: {
//                         messaging_product: 'whatsapp',
//                         to: from,
//                         text: {
//                             body: 'This text is from Service Plus. To initiate the chat. Say, Hi!!'
//                         }
//                     },
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': 'Bearer ' + token 
//                     }
//                 };
//                 if(msgBody === 'Hi' || msgBody === 'Test') {
//                     console.log("🚀 ~ file: index.js:149 ~ app.post ~ msgBody:", msgBody)
//                     const index = user.indexOf(userExist)
//                     userExist = {
//                         name: body.entry[0].changes[0].value.contacts[0].profile.name,
//                         mobile: from,
//                         step: 1
//                     };
//                     user.splice(index, 1);
//                     user.push(userExist);
//                     userExist = user.find(el => el.mobile === from);
//                     let userFormExist = userForm.find(el => el?.mobile === from);
//                     let question;
//                     question = formData[userExist.step-1].Q;
//                     axiosObj.data.text.body = question;
//                     if(userFormExist) {
//                         const userFormIndex = userForm.indexOf(userFormExist);
//                         userForm[userFormIndex].questionAnswer.push({
//                             [`Q${userExist.step}`]: formData[userExist.step-1].Q,
//                             [`A${userExist.step}`]: msgBody
//                         })
//                     }
//                     else {
//                         userForm.push(
//                             {
//                                 mobile: from,
//                                 questionAnswer: [
//                                     {
//                                         [`Q${userExist.step}`]: formData[userExist.step-1].Q,
//                                         [`A${userExist.step}`]: msgBody
//                                     }
//                                 ]
//                             }
//                         )
//                     }
//                 }
//                 else if(userExist.step>0) {
//                     console.log("🚀 ~ file: index.js:161 ~ app.post ~ userExist.step:", userExist.step)
//                     let userFormExist = userForm.find(el => el?.mobile === from);
//                     let question;
//                     question = formData[userExist.step-1].Q;
//                     axiosObj.data.text.body = question;

//                     const index = user.indexOf(userExist);
//                     userExist = {
//                         name: body.entry[0].changes[0].value.contacts[0].profile.name,
//                         mobile: from,
//                         step: userExist.step + 1
//                     };
//                     user.splice(index, 1);
//                     user.push(userExist);
//                     userExist = user.find(el => el.mobile === from);
//                     if(userFormExist) {
//                         const userFormIndex = userForm.indexOf(userFormExist);
//                         userForm[userFormIndex].questionAnswer.push({
//                             [`Q${userExist.step}`]: formData[userExist.step-1].Q,
//                             [`A${userExist.step}`]: msgBody
//                         })
//                     }
//                     else {
//                         userForm.push(
//                             {
//                                 mobile: from,
//                                 questionAnswer: [
//                                     {
//                                         [`Q${userExist.step}`]: formData[userExist.step-1].Q,
//                                         [`A${userExist.step}`]: msgBody
//                                     }
//                                 ]
//                             }
//                         )
//                     }
//                 }
//                 console.log("🚀 ~ file: index.js:92 ~ app.post ~ axiosObj:", axiosObj)
//                 const apiCall = await axios(axiosObj)
//                 console.log("🚀 ~ file: index.js:84 ~ app.post ~ apiCall:", apiCall)
//                 return res.status(200).json({ success: true })
//             }
//             else {
//                 console.log("🚀 ~ file: index.js:82 ~ app.post ~ out fail:", JSON.stringify(body))
//                 return res.status(400).json({ success: false })
//             }
//         } else {
//             console.log("🚀 ~ file: index.js:85 ~ app.post ~ out fail:")
//             return res.status(400).json({ success: false })
//         }
//     } catch (error) {
//         console.log("🚀 ~ file: index.js:99 ~ app.post ~ error:", error)
//         return res.status(500).json({ success: false })
//     }
// });

app.get('/webhook', (req, res) => {
    try {
        console.log('GET: Someone is pinging me!');

        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            env.Meta_WA_VerifyToken === token
        ) {
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    } catch (error) {
        console.error({ error });
        return res.sendStatus(500);
    }
});

app.post('/webhook', async (req, res) => {
    console.log('POST: Someone is pinging me!');
    try {
        let data = Whatsapp.parseMessage(req.body);

        if (data?.isMessage) {
            let incomingMessage = data.message;
            let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
            let recipientName = incomingMessage.from.name;
            let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
            let message_id = incomingMessage.message_id; // extract the message id

            // Start of cart logic
            if (!CustomerSession.get(recipientPhone)) {
                CustomerSession.set(recipientPhone, {
                    cart: [],
                });
            }

            let addToCart = async ({ product_id, recipientPhone }) => {
                let product = await Store.getProductById(product_id);
                if (product.status === 'success') {
                    CustomerSession.get(recipientPhone).cart.push(product.data);
                }
            };

            let listOfItemsInCart = ({ recipientPhone }) => {
                let total = 0;
                let products = CustomerSession.get(recipientPhone).cart;
                total = products.reduce(
                    (acc, product) => acc + product.price,
                    total
                );
                let count = products.length;
                return { total, products, count };
            };

            let clearCart = ({ recipientPhone }) => {
                CustomerSession.get(recipientPhone).cart = [];
            };
            // End of cart logic

            if (typeOfMsg === 'text_message') {
                await Whatsapp.sendSimpleButtons({
                    message: `Hey ${recipientName}, \nYou are speaking to a chatbot.\nWhat do you want to do next?`,
                    recipientPhone: recipientPhone,
                    listOfButtons: [
                        {
                            title: 'View some products',
                            id: 'see_categories',
                        },
                        {
                            title: 'Speak to a human',
                            id: 'speak_to_human',
                        },
                    ],
                });
            }

            if (typeOfMsg === 'radio_button_message') {
                let selectionId = incomingMessage.list_reply.id;

                if (selectionId.startsWith('product_')) {
                    let product_id = selectionId.split('_')[1];
                    let product = await Store.getProductById(product_id);
                    const {
                        price,
                        title,
                        description,
                        category,
                        image: imageUrl,
                        rating,
                    } = product.data;

                    let emojiRating = (rvalue) => {
                        rvalue = Math.floor(rvalue || 0); // generate as many star emojis as whole ratings
                        let output = [];
                        for (var i = 0; i < rvalue; i++) output.push('⭐');
                        return output.length ? output.join('') : 'N/A';
                    };

                    let text = `_Title_: *${title.trim()}*\n\n\n`;
                    text += `_Description_: ${description.trim()}\n\n\n`;
                    text += `_Price_: $${price}\n`;
                    text += `_Category_: ${category}\n`;
                    text += `${
                        rating?.count || 0
                    } shoppers liked this product.\n`;
                    text += `_Rated_: ${emojiRating(rating?.rate)}\n`;

                    await Whatsapp.sendImage({
                        recipientPhone,
                        url: imageUrl,
                        caption: text,
                    });

                    await Whatsapp.sendSimpleButtons({
                        message: `Here is the product, what do you want to do next?`,
                        recipientPhone: recipientPhone,
                        message_id,
                        listOfButtons: [
                            {
                                title: 'Add to cart🛒',
                                id: `add_to_cart_${product_id}`,
                            },
                            {
                                title: 'Speak to a human',
                                id: 'speak_to_human',
                            },
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                        ],
                    });
                }
            }

            if (typeOfMsg === 'simple_button_message') {
                let button_id = incomingMessage.button_reply.id;

                if (button_id === 'speak_to_human') {
                    // respond with a list of human resources
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Not to brag, but unlike humans, chatbots are super fast⚡, we never sleep, never rest, never take lunch🍽 and can multitask.\n\nAnway don't fret, a hoooooman will 📞contact you soon.\n\nWanna blast☎ his/her phone😈?\nHere are the contact details:`,
                    });

                    await Whatsapp.sendContact({
                        recipientPhone: recipientPhone,
                        contact_profile: {
                            addresses: [
                                {
                                    city: 'Nairobi',
                                    country: 'Kenya',
                                },
                            ],
                            name: {
                                first_name: 'Daggie',
                                last_name: 'Blanqx',
                            },
                            org: {
                                company: 'Mom-N-Pop Shop',
                            },
                            phones: [
                                {
                                    phone: '+1 (555) 025-3483',
                                },
                                {
                                    phone: '+254 712345678',
                                },
                            ],
                        },
                    });
                }
                if (button_id === 'see_categories') {
                    let categories = await Store.getAllCategories();

                    await Whatsapp.sendSimpleButtons({
                        message: `We have several categories.\nChoose one of them.`,
                        recipientPhone: recipientPhone,
                        message_id,
                        listOfButtons: categories.data
                            .slice(0, 3)
                            .map((category) => ({
                                title: category,
                                id: `category_${category}`,
                            })),
                    });
                }

                if (button_id.startsWith('category_')) {
                    let selectedCategory = button_id.split('category_')[1];
                    let listOfProducts = await Store.getProductsInCategory(
                        selectedCategory
                    );

                    let listOfSections = [
                        {
                            title: `🏆 Top 3: ${selectedCategory}`.substring(
                                0,
                                24
                            ),
                            rows: listOfProducts.data
                                .map((product) => {
                                    let id = `product_${product.id}`.substring(
                                        0,
                                        256
                                    );
                                    let title = product.title.substring(0, 21);
                                    let description =
                                        `${product.price}\n${product.description}`.substring(
                                            0,
                                            68
                                        );

                                    return {
                                        id,
                                        title: `${title}...`,
                                        description: `$${description}...`,
                                    };
                                })
                                .slice(0, 10),
                        },
                    ];

                    await Whatsapp.sendRadioButtons({
                        recipientPhone: recipientPhone,
                        headerText: `#BlackFriday Offers: ${selectedCategory}`,
                        bodyText: `Our Santa 🎅🏿 has lined up some great products for you based on your previous shopping history.\n\nPlease select one of the products below:`,
                        footerText: 'Powered by: BMI LLC',
                        listOfSections,
                    });
                }

                if (button_id.startsWith('add_to_cart_')) {
                    let product_id = button_id.split('add_to_cart_')[1];
                    await addToCart({ recipientPhone, product_id });
                    let numberOfItemsInCart = listOfItemsInCart({
                        recipientPhone,
                    }).count;

                    await Whatsapp.sendSimpleButtons({
                        message: `Your cart has been updated.\nNumber of items in cart: ${numberOfItemsInCart}.\n\nWhat do you want to do next?`,
                        recipientPhone: recipientPhone,
                        message_id,
                        listOfButtons: [
                            {
                                title: 'Checkout 🛍️',
                                id: `checkout`,
                            },
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                        ],
                    });
                }

                if (button_id === 'checkout') {
                    let finalBill = listOfItemsInCart({ recipientPhone });
                    let invoiceText = `List of items in your cart:\n`;

                    finalBill.products.forEach((item, index) => {
                        let serial = index + 1;
                        invoiceText += `\n#${serial}: ${item.title} @ $${item.price}`;
                    });

                    invoiceText += `\n\nTotal: $${finalBill.total}`;

                    Store.generatePDFInvoice({
                        order_details: invoiceText,
                        file_path: `./invoice_${recipientName}.pdf`,
                    });

                    await Whatsapp.sendText({
                        message: invoiceText,
                        recipientPhone: recipientPhone,
                    });

                    await Whatsapp.sendSimpleButtons({
                        recipientPhone: recipientPhone,
                        message: `Thank you for shopping with us, ${recipientName}.\n\nYour order has been received & will be processed shortly.`,
                        message_id,
                        listOfButtons: [
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                            {
                                title: 'Print my invoice',
                                id: 'print_invoice',
                            },
                        ],
                    });

                    clearCart({ recipientPhone });
                }

                if (button_id === 'print_invoice') {
                    // Send the PDF invoice
                    await Whatsapp.sendDocument({
                        recipientPhone,
                        caption: `Mom-N-Pop Shop invoice #${recipientName}`,
                        file_path: `./invoice_${recipientName}.pdf`,
                    });

                    // Send the location of our pickup station to the customer, so they can come and pick their order
                    let warehouse = Store.generateRandomGeoLocation();

                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Your order has been fulfilled. Come and pick it up, as you pay, here:`,
                    });

                    await Whatsapp.sendLocation({
                        recipientPhone,
                        latitude: warehouse.latitude,
                        longitude: warehouse.longitude,
                        address: warehouse.address,
                        name: 'Mom-N-Pop Shop',
                    });
                }
            }

            await Whatsapp.markMessageAsRead({
                message_id,
            });
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error({ error });
        return res.sendStatus(500);
    }
});


exports.app = functions.https.onRequest(app);