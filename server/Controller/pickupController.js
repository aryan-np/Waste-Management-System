const PickupRequest = require('../Model/pickupRequest');
const User = require('../Model/User');

// Create pickup request
const createPickupRequest = async (req, res) => {
    try {
        const { address, landmark, date, time, message } = req.body;
        const userId = req.user.userId;

        if (!address || !date || !time) {
            return res.status(400).json({ message: 'Address, date, and time are required.' });
        }

        const newRequest = await PickupRequest.create({
            user: userId,
            address,
            landmark,
            date,
            time,
            message
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

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const admin = await User.findById(req.user.userId);
        // Uncomment this if admin check is needed
        // if (!admin || admin.role !== 'admin') {
        //     return res.status(403).json({ message: 'Access denied. Admins only.' });
        // }

        const existingPickup = await PickupRequest.findById(id).populate('user');
        if (!existingPickup) {
            return res.status(404).json({ message: 'Pickup request not found' });
        }

        if (existingPickup.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request is already resolved and cannot be modified.' });
        }

        // Now safely update status only
        const updatedPickup = await PickupRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('user');

        // Send email
        const subject = `Your Pickup Request has been ${status}`;
        const text = `Hello ${updatedPickup.user.name},\n\nYour waste pickup request has been ${status.toLowerCase()}.\n\nRegards,\nWaste Management Team`;

        await sendMail(updatedPickup.user.email, subject, text);

        res.json({ message: `Request ${status.toLowerCase()}`, request: updatedPickup });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    createPickupRequest,
    viewPickupRequests,
    updatePickupRequest
};
