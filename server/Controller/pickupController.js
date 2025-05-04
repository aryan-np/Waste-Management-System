const PickupRequest = require('../Model/pickupRequest');
const User = require('../Model/User');

// Create pickup request
const createPickupRequest = async (req, res) => {
    console.log("here");
    
    try {
        const { address } = req.body;
        console.log(address);
        
        const userId = req.user.userId;
        console.log(userId);
        

        const newRequest = await PickupRequest.create({
            user: userId,
            address
        });

        res.status(201).json({ message: 'Pickup request created', request: newRequest });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View all requests (admin only)
const viewPickupRequests = async (req, res) => {
    console.log("veiwing");
    
    try {
        const user = await User.findById(req.user.userId);
        // if (!user || user.role !== 'admin') {
        //     return res.status(403).json({ message: 'Access denied. Admins only.' });
        // }

        const requests = await PickupRequest.find().populate('user', 'name email number');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const {sendMail} = require('../Controller/mail'); // assumed mail util

const updatePickupRequest = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        console.log(id);
        
        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const admin = await User.findById(req.user.userId);
        // if (!admin || admin.role !== 'admin') {
        //     return res.status(403).json({ message: 'Access denied. Admins only.' });
        // }

        // Fetch request and check if it's still pending
        const pickup = await PickupRequest.findById(id).populate('user');
        if (!pickup) {
            return res.status(404).json({ message: 'Pickup request not found' });
        }

        if (pickup.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request is already resolved and cannot be modified.' });
        }

        // Update status
        pickup.status = status;
        await pickup.save();

        // Send email
        const subject = `Your Pickup Request has been ${status}`;
        const text = `Hello ${pickup.user.name},\n\nYour waste pickup request has been ${status.toLowerCase()}.\n\nRegards,\nWaste Management Team`;

        await sendMail(pickup.user.email, subject, text);

        res.json({ message: `Request ${status.toLowerCase()}`, request: pickup });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createPickupRequest,
    viewPickupRequests,
    updatePickupRequest
};
