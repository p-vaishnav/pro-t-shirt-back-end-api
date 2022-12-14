const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// for swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// for json body and url-encoded
// what if express.json is not there??
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// for cookie and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// for logger
app.use(morgan('tiny'));

// handling routes
const home = require('./routes/home'); 
const user = require('./routes/user');
const product = require('./routes/product');
const order = require('./routes/order');

app.use('/api/v1', home); // done
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);

// temporary testing
app.set('view engine', 'ejs');
app.get('/signuptest', (req, res) => res.render('signuptest.ejs'));

// exporting app.js
module.exports = app;