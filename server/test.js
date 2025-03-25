const vehicleRoutes = [
    {
        location: "Kathmandu",
        schedule: [
            { day: "Monday", time: "07:00 AM - 09:00 AM" },
            { day: "Thursday", time: "06:30 AM - 08:30 AM" }
        ]
    },
    {
        location: "Lalitpur",
        schedule: [
            { day: "Tuesday", time: "08:00 AM - 10:00 AM" },
            { day: "Friday", time: "07:30 AM - 09:30 AM" }
        ]
    },
    {
        location: "Bhaktapur",
        schedule: [
            { day: "Wednesday", time: "06:45 AM - 08:45 AM" },
            { day: "Saturday", time: "07:15 AM - 09:15 AM" }
        ]
    },
    {
        location: "Pokhara",
        schedule: [
            { day: "Monday", time: "09:00 AM - 11:00 AM" },
            { day: "Thursday", time: "08:30 AM - 10:30 AM" }
        ]
    },
    {
        location: "Chitwan",
        schedule: [
            { day: "Sunday", time: "07:00 AM - 09:00 AM" },
            { day: "Wednesday", time: "06:30 AM - 08:30 AM" }
        ]
    }
];

// Insert into MongoDB
const VehicleRoute = require("./Model/vehicle");

async function insertMockData() {
    try {
        await VehicleRoute.insertMany(vehicleRoutes);
        console.log("Mock vehicle routes inserted successfully!");
    } catch (error) {
        console.error("Error inserting mock data:", error);
    }
}

insertMockData();
