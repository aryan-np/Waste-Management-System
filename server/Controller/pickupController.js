const PickupRequest = require('../Model/pickupRequest');
const User = require('../Model/User');

// Create pickup request
const createPickupRequest = async (req, res) => {
    try {
        const { userName,userEmail,address, landmark, date, time, message } = req.body;
        const userId = req.user.userId;

        if (!address || !date || !time) {
            return res.status(400).json({ message: 'Address, date, and time are required.' });
        }

        const newRequest = await PickupRequest.create({
            userName,
            userEmail,
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
    // console.log("veiwing");
    
    try {
        const user = await User.findById(req.user.userId);
        // if (!user || user.role !== 'admin') {
        //     return res.status(403).json({ message: 'Access denied. Admins only.' });
        // }

        const requests = await PickupRequest.find();
        // console.log(requests);
        
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const {sendMail} = require('../Controller/mail'); // assumed mail util

const updatePickupRequest = async (req, res) => {
    try {
        const { status,message} = req.body;
        
        const { id } = req.params;
        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        // const admin = await User.findById(req.user.userId);
        const existingPickup = await PickupRequest.findById(id);
        if (!existingPickup) {
            return res.status(404).json({ message: 'Pickup request not found' });
        }

        if (existingPickup.status !== 'PENDING') {
            return res.status(400).json({ message: 'Request is already resolved and cannot be modified.' });
        }

        const updatedPickup = await PickupRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        // Send email
        const subject = `Your Pickup Request has been ${status}`;
        const text = `Hello ${updatedPickup.userName},\n\nYour waste pickup request has been ${status.toLowerCase()}.\n
        \n${message}\n\nRegards,\nWaste Management Team`;

        await sendMail(updatedPickup.userEmail, subject, text);

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
