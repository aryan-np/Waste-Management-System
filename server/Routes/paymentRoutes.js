const express = require('express');
const router = express.Router();
const esewaController = require('../Controller/esewaController');
// const authMiddleware = require('../middleware/auth'); // Your auth middleware

// Initiate eSewa payment (protected route)
router.post('/esewa/pay', esewaController.initiatePayment);

// eSewa callback URLs (public routes)
router.get('/esewa/success', esewaController.paymentSuccess);
router.get('/esewa/failure', esewaController.paymentFailure);

// Payment status check (protected route)
router.get('/status/:transaction_uuid',  esewaController.checkPaymentStatus);

module.exports = router;