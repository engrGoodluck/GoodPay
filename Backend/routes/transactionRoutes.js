const express = require("express");
const auth = require("../middleware/auth");

const {
    transfer,
    getTransactions
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/transfer", auth, transfer);

router.get("/transactions", auth, getTransactions);

module.exports = router;