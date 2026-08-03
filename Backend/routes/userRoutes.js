const upload = require("../middleware/upload");
const express = require("express");
const auth = require("../middleware/auth");

const {
    getUsers,
    updateProfile,
    uploadProfilePicture
} = require("../controllers/userController");

const router = express.Router();

// GET ALL USERS
router.get("/users", auth, getUsers);

// UPDATE PROFILE
router.put("/profile", auth, updateProfile);

// UPLOAD PROFILE PICTURE
router.post(
    "/upload-profile-picture",
    auth,
    upload.single("profile_picture"),
    uploadProfilePicture
);

module.exports = router;