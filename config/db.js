const mongoose = require('mongoose');

const connectWithDB = () => {
    mongoose.connect(process.env.MONGO_URI, {
       useNewUrlParser: true,
       useUnifiedTopology: true 
    })
    .then(() => console.log(`DB Connected Successfully`))
    .catch((err) => {
        console.log('DB has a connection issue');
        console.log(err);
        process.exit(1);
    });
};

module.exports = connectWithDB;