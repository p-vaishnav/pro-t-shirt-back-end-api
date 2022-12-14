const app = require('./app');
require('dotenv').config();
const connectWithDB = require('./config/db');
const cloudinary = require('cloudinary');

// connecting with Data Base
connectWithDB();

// configuring clodinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`))
