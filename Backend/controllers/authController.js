const { sendOTP } = require("../services/emailService");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// User Registeration
const register = async (req, res) => {

    const { name, email, password } = req.body;

    if (!name) {
        return res.json({
            success: false,
            message: "Name is required."
        });
    }

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required."
        });
    }

    if (!password) {
        return res.json({
            success: false,
            message: "Password is required."
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [name, email, hashedPassword]
        );

        const userId = userResult.rows[0].id;

        await pool.query(
            `INSERT INTO wallets (user_id)
             VALUES ($1)`,
            [userId]
        );

        res.json({
            success: true,
            message: "User registered successfully!"
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// LOGIN USER
const login = async (req, res) => {

    const { email, password } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required."
        });
    }

    if (!password) {
        return res.json({
            success: false,
            message: "Password is required."
        });
    }

    try {

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Incorrect password."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            success: true,
            message: "Login successful!",
            token
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// PROFILE
const profile = async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// CREATE PIN
const createPin = async (req, res) => {

    const { pin } = req.body;

    if (!pin) {
        return res.json({
            success: false,
            message: "PIN is required."
        });
    }

    if (!/^\d{4}$/.test(pin)) {
        return res.json({
            success: false,
            message: "PIN must be exactly 4 digits."
        });
    }

    try {

        const hashedPin = await bcrypt.hash(pin, 10);

        await pool.query(
            `UPDATE users
             SET pin = $1
             WHERE id = $2`,
            [hashedPin, req.user.id]
        );

        res.json({
            success: true,
            message: "Transaction PIN created successfully."
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// CHANGE PIN
const changePin = async (req, res) => {

    const { oldPin, newPin } = req.body;

    if (!oldPin) {
        return res.json({
            success: false,
            message: "Old PIN is required."
        });
    }

    if (!newPin) {
        return res.json({
            success: false,
            message: "New PIN is required."
        });
    }

    if (!/^\d{4}$/.test(newPin)) {
        return res.json({
            success: false,
            message: "New PIN must be exactly 4 digits."
        });
    }

    try {

        const result = await pool.query(
            "SELECT pin FROM users WHERE id = $1",
            [req.user.id]
        );

        const user = result.rows[0];

        const pinMatch = await bcrypt.compare(oldPin, user.pin);

        if (!pinMatch) {
            return res.json({
                success: false,
                message: "Old PIN is incorrect."
            });
        }

        if (oldPin === newPin) {
            return res.json({
                success: false,
                message: "New PIN must be different from the old PIN."
            });
        }

        const hashedPin = await bcrypt.hash(newPin, 10);

        await pool.query(
            `UPDATE users
             SET pin = $1
             WHERE id = $2`,
            [hashedPin, req.user.id]
        );

        res.json({
            success: true,
            message: "Transaction PIN changed successfully."
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// CHANGE PASSWORD
const changePassword = async (req, res) => {

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword) {
        return res.json({
            success: false,
            message: "Old password is required."
        });
    }

    if (!newPassword) {
        return res.json({
            success: false,
            message: "New password is required."
        });
    }

    if (!confirmPassword) {
        return res.json({
            success: false,
            message: "Please confirm your new password."
        });
    }

    if (newPassword !== confirmPassword) {
        return res.json({
            success: false,
            message: "Passwords do not match."
        });
    }

    if (oldPassword === newPassword) {
        return res.json({
            success: false,
            message: "New password must be different from the old password."
        });
    }

    try {

        const result = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [req.user.id]
        );

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Old password is incorrect."
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await pool.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2`,
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// REQUEST PASSWORD RESET
const forgotPassword = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required."
        });
    }

    try {

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        // Generate a random 6-digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // OTP expires in 10 minutes
        const expiry = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await pool.query(
            `UPDATE users
             SET reset_otp = $1,
                 otp_expires_at = $2
             WHERE email = $3`,
            [otp, expiry, email]
        );

        await sendOTP(email, otp);

        res.json({
            success: true,
            message: "Password reset OTP has been sent to your email."
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// RESET PASSWORD USING OTP
const resetPassword = async (req, res) => {

    const {
        email,
        otp,
        newPassword,
        confirmPassword
    } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required."
        });
    }

    if (!otp) {
        return res.json({
            success: false,
            message: "OTP is required."
        });
    }

    if (!newPassword) {
        return res.json({
            success: false,
            message: "New password is required."
        });
    }

    if (!confirmPassword) {
        return res.json({
            success: false,
            message: "Please confirm your new password."
        });
    }

    if (newPassword !== confirmPassword) {
        return res.json({
            success: false,
            message: "Passwords do not match."
        });
    }

    try {

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        const user = result.rows[0];

        if (user.reset_otp !== otp) {
            return res.json({
                success: false,
                message: "Invalid OTP."
            });
        }

        if (new Date() > user.otp_expires_at) {
            return res.json({
                success: false,
                message: "OTP has expired."
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await pool.query(
            `UPDATE users
             SET password = $1,
                 reset_otp = NULL,
                 otp_expires_at = NULL
             WHERE email = $2`,
            [hashedPassword, email]
        );

        res.json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    register,
    login,
    profile,
    createPin,
    changePin,
    changePassword,
    forgotPassword,
    resetPassword
};