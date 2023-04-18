const mongoose = require('mongoose');

const Connection = async (username, password) => {
    const URL = `mongodb://localhost:27017/api-structure`

    try {

        await mongoose.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true });
        console.log('Database Connected Succesfully');
    } catch(error) {
        console.log('Error: ', error.message);
    }
}

module.exports = Connection;