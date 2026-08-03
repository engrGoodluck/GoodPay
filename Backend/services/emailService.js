const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});

const sendOTP = async (email, otp) => {

    await transporter.sendMail({

        from: `"GoodPay" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "GoodPay Password Reset OTP",

        html: `
            <h2>GoodPay</h2>

            <p>Your password reset code is:</p>

            <h1>${otp}</h1>

            <p>This OTP expires in <strong>10 minutes</strong>.</p>

            <p>If you didn't request this, please ignore this email.</p>
        `

    });

};

module.exports = {
    sendOTP
};