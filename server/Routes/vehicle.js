const express = require("express");
const router = express.Router();
const {handleVehicleRoutes,handleVehicleSchedule}=require('../Controller/vehicle')

// Get all available locations
router.get("/locations",handleVehicleRoutes );
router.get("/schedule/:routeName",handleVehicleSchedule );


module.exports = router;
