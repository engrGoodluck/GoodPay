const express = require("express");
const auth = require("../middleware/auth");

const {
    register,
    login,
    profile,
    createPin,
    changePin,
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", auth, profile);
router.post("/create-pin", auth, createPin);
router.post("/change-pin", auth, changePin);
router.put("/change-password", auth, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);

module.exports = router;