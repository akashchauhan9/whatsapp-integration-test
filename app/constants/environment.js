require('dotenv').config()

const env = {
    Meta_WA_accessToken: process.env.Meta_WA_accessToken,
    Meta_WA_SenderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
    Meta_WA_wabaId: process.env.Meta_WA_wabaId,
    token: process.env.TOKEN,
    myToken: process.env.MY_TOKEN,
    PORT: process.env.PORT
};

module.exports = {
    env
};