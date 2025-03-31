const mongoose = require("mongoose");

const VehicleRouteSchema = new mongoose.Schema({
    routeName: { type: String, required: true }, // Name of the route
    locations: [{ type: String, required: true }], // Array of locations
    schedule: [{ 
        day: { type: String, required: true }, // Day of the week (e.g., "Monday")
        time: { type: String, required: true } // Time range (e.g., "10:00 AM - 12:00 PM")
    }]
});

module.exports = mongoose.model("VehicleRoute", VehicleRouteSchema);

