const VehicleRoute = require("../Model/vehicle");

const handleVehicleRoutes = async (req, res) => {
    try {
        const locations = await VehicleRoute.find().select(["locations","routeName"]);
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching locations" });
    }
}

const handleVehicleSchedule = async (req, res) => {
    try {
        // Fetch the route name from the URL parameters (e.g., /schedule/Route%201)
        const routeName = req.params.routeName;

        // Fetch the route schedule based on the route name
        const route = await VehicleRoute.findOne({ routeName });

        // Check if the route exists
        if (!route) {
            return res.status(404).json({ message: "No route found with this name" });
        }

        // Return the route's locations and schedule
        res.json({
            routeName: route.routeName,
            locations: route.locations,
            schedule: route.schedule
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching schedule" });
    }
}

module.exports = { handleVehicleRoutes, handleVehicleSchedule };
