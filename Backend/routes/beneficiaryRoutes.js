const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
    getBeneficiaries
} = require("../controllers/beneficiaryController");

router.get("/", auth, getBeneficiaries);

module.exports = router;