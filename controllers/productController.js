// lets import all the required stuff

const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/product");
const User = require("../models/user");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");
const cloudinary = require('cloudinary').v2;

//-----------------------------------USER CONTROLLERS-----------------------

// create a product
exports.addProduct = BigPromise(async (req, res, next) => {

    // creating an imagesArray
    const imagesArray = [];

    if (!req.files || !req.files.photos) {
        return next(new CustomError('Please provide a photos in the file'));
    }

    for (let i = 0; i < req.files.photos.length; i++) {
        let result = await cloudinary.uploader.upload(req.files.photos[i].tempFilePath, {
            folder: 'products'
        });

        imagesArray.push({
            id: result.public_id,
            secure_url: result.secure_url
        });
    }

    req.body.photos = imagesArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json(product);
});

// get all products
// my code did worked and it looks good too,
// what should I do, seems will learn something new
exports.getAllProducts = BigPromise(async (req, res, next) => {
    const resultsPerPage = 6;
    const totalProductCount = await Product.countDocuments();

    // req.query is amazing
    let products = new WhereClause(Product.find(), req.query).search().filter();
    const filteredNumberOfProducts = products.base.length;

    products.pager(resultsPerPage);
    products = await products.base;

    res.status(200).json({
        success: true,
        products,
        filteredNumberOfProducts,
        totalProductCount
    });
});

// getASingleProduct
exports.getSingleProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError('Invalid product id'));
    }

    res.status(200).json({
        success: true,
        product
    });
});

exports.addReview = BigPromise(async (req, res, next) => {
    const {productId, comment, rating} = req.body;

    // grab a user from db, this is I have configured my isLoggedIn Route, check hitesh's code files once
    const user = await User.findById(req.user.id);

    const review = {
        user: user._id,
        name: user.name,
        comment,
        rating
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new CustomError('Invlaid product ID...'));
    }

    if (!product.reviews) {
        product.reviews = [];
    }

    const alreadyReviewed = product.reviews.find((review) => {
        if (review.user.toString() === req.user.id) {
            return true;
        }
    });

    if (alreadyReviewed) {
        product.reviews.forEach((review, i) => {
            if (review.user.toString() === req.user.id) {
                product.reviews[i].comment = comment;
                product.reviews[i].name = user.name;
            }   
        })
    } else {
        product.reviews.push(review);
    }

    product.numberOfReviews = product.reviews.length;
    product.rating = Math.floor(product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length);

    // saving the product
    product.save();

    res.status(200).json({
        success: true,
        product
    });
});

// deleting a review && getting reviews for one and only one product
exports.deleteReview = BigPromise(async (req, res, next) => {
    const {productId} = req.body;

    const product = await Product.findById(productId);

    const reviews = product.filter((review) => review.user.toString() === req.user.id);

    const numberOfReviews = product.reviews.length;
    const rating = Math.floor(product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length);

    await Product.findByIdAndUpdate(productId, {
        reviews,
        numberOfReviews,
        rating
    }, {
        new: true, // returns the modified rather than the original one
        runValidators: true,
        useFindAndModify: false
    });
});

// gets reviews for one product
exports.getReviewForAProduct = BigPromise(async (req, res, next) => {
    const {productId} = req.body;

    const product = await Product.findById(productId);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
});


// -----------------------------------ADMIN CONTROLLERS-----------------------

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    });
});

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError('Invalid product id'));
    }

    let imagesArray = [];

    if (req.files && req.files.photos) {
        // destroy pre-uploaded photos from cloudinary
        for (let i = 0; i < product.photos.length; i++) {
            const result = await cloudinary.uploader.destroy(product.photos[i].id);
        }

        // upload all the new photos
        for (let i = 0; i < req.files.photos.length; i++) {
            const result = await cloudinary.uploader.upload(req.files.photos[i].tempFilePath, {
                folder: 'products' // this should go into the .env because if this misses it will cause a whole lot of mess
            });

            imagesArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
        }
    }

    // TODO: this where the bug was present
    req.body.photos = imagesArray.length === 0 ? undefined : imagesArray;
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // returns the modified rather than the original one
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    });

});

exports.adminDeleteProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError('Invalid product id'));
    }

    // destroy pre-uploaded photos from cloudinary
    for (let i = 0; i < product.photos.length; i++) {
        const result = await cloudinary.uploader.destroy(product.photos[i].id);
    }

    // inorder to delete a product
    product.remove();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    });
});

// for testing, keep it as it is
exports.testProduct = async (req, res) => {
    // this is quite amazing thoroughly enjoyed parsing of it
    console.log(req.query);
    res.status(200).json({
        success: true,
        message: 'In test product route'
    });
};