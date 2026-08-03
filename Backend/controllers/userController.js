const pool = require("../db");

// GET ALL USERS
const getUsers = async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM users"
        );

        res.json(result.rows);

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// UPLOAD PROFILE PICTURE
const uploadProfilePicture = async (req, res) => {

    if (!req.file) {
        return res.json({
            success: false,
            message: "Please upload an image."
        });
    }

    try {

        const imagePath = `/uploads/${req.file.filename}`;

        await pool.query(
            `UPDATE users
             SET profile_picture = $1
             WHERE id = $2`,
            [imagePath, req.user.id]
        );

        res.json({
            success: true,
            message: "Profile picture uploaded successfully.",
            data: {
                profile_picture: imagePath
            }
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// UPDATE PROFILE
const updateProfile = async (req, res) => {

    const { name, email } = req.body;

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

    try {

        // Check if another user already uses this email
        const emailCheck = await pool.query(
            `SELECT id
             FROM users
             WHERE email = $1
             AND id != $2`,
            [email, req.user.id]
        );

        if (emailCheck.rows.length > 0) {
            return res.json({
                success: false,
                message: "Email already exists."
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET name = $1,
                 email = $2
             WHERE id = $3
             RETURNING id, name, email`,
            [name, email, req.user.id]
        );

        res.json({
            success: true,
            message: "Profile updated successfully.",
            data: result.rows[0]
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getUsers,
    updateProfile,
    uploadProfilePicture
};