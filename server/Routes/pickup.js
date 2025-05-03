const express = require('express');
const router = express.Router();
const {
    createPickupRequest,
    viewPickupRequests,
    updatePickupRequest
} = require('../Controller/pickupController');

const { isAuthenticated } = require('../Middleware/auth');

// User creates a request
router.post('/pickup-request', isAuthenticated, createPickupRequest);

// Admin views all requests
router.get('/pickup-requests', isAuthenticated, viewPickupRequests);

// Admin accepts or rejects a request
router.put('/pickup-request/:id', isAuthenticated, updatePickupRequest);

module.exports = router;
