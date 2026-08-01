const express = require("express");
const auth = require("../middleware/auth");

const {
    transfer
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/transfer", auth, transfer);

module.exports = router;