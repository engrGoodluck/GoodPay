const express = require("express");
const auth = require("../middleware/auth");

const {
    deposit,
    getWallet
} = require("../controllers/walletController");

const router = express.Router();

router.post("/deposit", auth, deposit);

router.get("/wallet", auth, getWallet);

module.exports = router;