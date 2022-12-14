const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const mailHelper = require('../utils/mailHelper');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

// done
exports.signup = BigPromise(async (req, res, next) => {
    let result;

    // TODO: use case is breaking when I am giving existing email, but image do gets uploaded

    if (req.files) {
        const file = req.files.photo;
        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'users',
            width: 150,
            crop: 'scale'
        });
    }
    const {email, password, name} = req.body;

    if (!email || !password || !name) {
        return new next(CustomError('Name, Password and Email are mandatory fields', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });
    cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return next(new CustomError('Please provide email or password', 400));
    }

    const user = await User.findOne({email}).select('+password');

    if (!user) {
        return next(new CustomError('You are not registered in DB', 400));
    }
   
    const isPasswordValid = await user.isValidatedPassword(password);

    if (!isPasswordValid) {
        return next(new CustomError("Email and Password doesn't match ", 400));
    }

    cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    // instead of chaining we can send two responses
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'logout success'
    })
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
    const {email} = req.body;

    const user = await User.findOne({email});

    if (!user) {
        return next(new CustomError('User not found', 400));
    }

    const forgotPasswordToken = await user.generateForgotPasswordToken();

    await user.save({validateBeforeSave: false});

    const myUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${forgotPasswordToken}`;

    const message = `Copy and paste this url in new tab ${myUrl}`;

    // what if mail isn't sent successfully
    try {
        await mailHelper({
            email: user.email,
            subject: user.subject,
            message: message
        });

        res.status(200).json({
            message: 'success'
        });
    } catch (err) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save({validateBeforeSave: false});

        next(new CustomError('Error while sending email to user', 500));
    }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
    const token = req.params.tokenId;

    // encrypt provided token because model stores the encrypted one
    const forgotPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({forgotPasswordToken, forgotPasswordExpiry: {$gt: Date.now()}});

    // what is user doesn't exist
    if (!user) {
        return next(new CustomError('Token is invalid or expired'), 400);
    }

    // checking if provided password is equal to the confirm password, can be done in frontend but this is what pro-backend-means
    if (req.body.password !== req.body.confirmPassword) {
        return next(new CustomError("Password and Confirm password doesn't match", 400));
    }

    user.password = req.body.password;

    // clearing forgotPassword fields, after password has reset successfully
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    cookieToken(user, res);
});

exports.userDashboard = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        user
    });
});

exports.updatePassword = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const isOldPasswordCorrect = await user.isValidatedPassword(req.body.oldPassword);

    if (!isOldPasswordCorrect) {
        return next(new CustomError('Old password is not correct...', 400));
    }

    user.password = req.body.password;

    await user.save();

    res.status(200).json(user);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
    // a user can update name, email and photo

    const newData = {
        name: req.body.name,
        email: req.body.email
    };

    // image part is some what tricky
    if (req.files && req.files.photo !== '') {
        const user = await User.findById(req.user.id);

        const photoId = user.photo.id;

        // destroying the photo
        const response = await cloudinary.uploader.destroy(photoId);

        // uploading a photo
        const file = req.files.photo;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'users',
            width: 150,
            crop: 'scale'
        });

        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData,
    // options that I have found are interesting
    // runValidators, timestamps, 
    {
        new: true, // returns the modified rather than the original one
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        user
    });
});

// admin users
exports.adminAllUsers = BigPromise(async (req, res, next) => {
    // DB is always on another continent
    const users = await User.find({});

    res.status(200).json({
        success: true,
        users
    });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
    const id = req.params.id;

    const user = await User.findById(id);

    res.status(200).json({
        success: true,
        user
    })
});

exports.adminUpdateOneUser = BigPromise(async (req, res, next) => {
    // a user can update name, email and photo

    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.user.id, newData,
    // options that I have found are interesting
    // runValidators, timestamps, 
    {
        new: true, // returns the modified rather than the original one
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        user
    });
});

exports.adimDeleteOneUser = BigPromise(async (req, res, next) => {
    const _id = req.params.id;
    const user = await User.deleteOne({_id});

    const photoId = user.photo.id;

     // destroying the photo
     const response = await cloudinary.uploader.destroy(photoId);

    res.status(200).json({
        status: 'User deleted successfully'
    });
});

// manager users
// TODO: I should not give manager all the data of the user instead a photo, name and email is sufficient
exports.managerAllUsers = BigPromise(async (req, res, next) => {
    // DB is always on another continent
    const users = await User.find({role: 'user'});

    res.status(200).json({
        success: true,
        users
    });
});
