// transporter has information of the sender

const nodemailer = require('nodemailer');

const mailHelper = async (options) => {
    // create a reusable transported
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const _options = {
        // here hitesh has hardcoded not sure why
        from: 'hitesh@lco.dev',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(_options)
};

module.exports = mailHelper;