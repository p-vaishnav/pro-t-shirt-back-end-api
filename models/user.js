const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'Name should have characters less than 40']
    },

    email: {
        type: String,
        required: [true, 'Please provide a valid email'],
        validate: [validator.isEmail, 'Please enter email in a correct format'],
        unique: true
    },

    password: {
        type: String,
        required: [true, 'Please provide a valid password'],
        minlength: [6, 'length of password should be more than 6 char'],
        // quite usefull when fetching a user in memory password should not come, if programmer wants it mention it explicitly
        select: false
    },

    role: {
        type: String,
        default: 'user'
    },

    photo: {
        id: {
            type: String,
            // required: true
        },

        secure_url: {
            type: String,
            // required: true
        }
    },

    forgotPasswordToken: String,

    forgotPasswordExpiry: Date,

    createdAt: {
        type: Date,
        // TODO: huh problem, calling the function here only, check interms of testing what is stored in DB
        default: Date.now
    }
});

// encrypt the password before saving into the DB!!
userSchema.pre('save', async function(next) {
    // while saving any document if and only if password field is modified then only encrypt the password
    if(!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// validating a password
userSchema.methods.isValidatedPassword = async function(userPassword) {
    return await bcrypt.compare(userPassword, this.password);
};

// creating a jwt token
userSchema.methods.createJwtToken = function() {
    return jwt.sign({id: this._id, role: this.role}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    });
};

// generate forgot password token
userSchema.methods.generateForgotPasswordToken = function() {
    // generate a long random string
    const forgotPasswordToken = crypto.randomBytes(20).toString('hex');

    // hash that random string, and store it in db
    // hashed random string is stored in db, and normal random string is send to user
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotPasswordToken).digest('hex');
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

    // return the normalized random string
    return forgotPasswordToken;
}

module.exports = mongoose.model('User', userSchema);