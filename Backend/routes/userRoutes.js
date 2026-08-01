const express = require("express");
const auth = require("../middleware/auth");

const {
    getUsers,
    updateProfile
} = require("../controllers/userController");

const router = express.Router();

// GET ALL USERS
router.get("/users", auth, getUsers);

// UPDATE PROFILE
router.put("/profile", auth, updateProfile);

module.exports = router;