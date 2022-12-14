const cookieToken = (user, res) => {
    const token = user.createJwtToken();

    // Using the HttpOnly flag when generating a cookie helps mitigate the risk of client side script accessing the protected cookie
    const options = {
        expire:  24 * 60 * 60 * 1000,
        httpOnly: true
    };

    res.status(200).cookie('token', token, options).json({
        token,
        name: user.name,
        email: user.email,
        password: user.password
    });
};

module.exports = cookieToken;