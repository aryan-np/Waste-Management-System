const express = require("express");
const { initiateBillPayment, verifyPayment } = require("../Controller/billController");

const router = express.Router();

router.post("/initiate-payment",  initiateBillPayment);
router.post("/verify-payment", verifyPayment);

module.exports = router;
