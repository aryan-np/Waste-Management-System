
const vehicleRoutes = [
    {
        routeName: "Route 1",
        locations: ["Baneshwor", "Koteshwor", "Boudha"],
        schedule: [
            { day: "Monday", time: "07:00 AM - 09:00 AM" },
            { day: "Thursday", time: "06:30 AM - 08:30 AM" }
        ]
    },
    {
        routeName: "Route 2",
        locations: ["Lazimpat", "Baluwatar", "Maharajgunj"],
        schedule: [
            { day: "Tuesday", time: "08:00 AM - 10:00 AM" },
            { day: "Friday", time: "07:30 AM - 09:30 AM" }
        ]
    },
    {
        routeName: "Route 3",
        locations: ["Thamel", "Sundhara", "Kalanki"],
        schedule: [
            { day: "Wednesday", time: "06:45 AM - 08:45 AM" },
            { day: "Saturday", time: "07:15 AM - 09:15 AM" }
        ]
    },
    {
        routeName: "Route 4",
        locations: ["Kirtipur", "Teku", "Tripureshwor"],
        schedule: [
            { day: "Monday", time: "09:00 AM - 11:00 AM" },
            { day: "Thursday", time: "08:30 AM - 10:30 AM" }
        ]
    },
    {
        routeName: "Route 5",
        locations: ["Gongabu", "Samakhusi", "Dhapasi"],
        schedule: [
            { day: "Sunday", time: "07:00 AM - 09:00 AM" },
            { day: "Wednesday", time: "06:30 AM - 08:30 AM" }
        ]
    },
    {
        routeName: "Route 6",
        locations: ["Chabahil", "Naya Bazaar", "Swayambhu"],
        schedule: [
            { day: "Monday", time: "08:00 AM - 10:00 AM" },
            { day: "Friday", time: "06:00 AM - 08:00 AM" }
        ]
    },
    {
        routeName: "Route 7",
        locations: ["Patan", "Lagankhel", "Imadol"],
        schedule: [
            { day: "Tuesday", time: "09:00 AM - 11:00 AM" },
            { day: "Saturday", time: "07:30 AM - 09:30 AM" }
        ]
    },
    {
        routeName: "Route 8",
        locations: ["Budhanilkantha", "Gokarna", "Jorpati"],
        schedule: [
            { day: "Wednesday", time: "07:15 AM - 09:15 AM" },
            { day: "Sunday", time: "08:30 AM - 10:30 AM" }
        ]
    },
    {
        routeName: "Route 9",
        locations: ["Balkhu", "Toll Plaza", "Pharping"],
        schedule: [
            { day: "Thursday", time: "08:00 AM - 10:00 AM" },
            { day: "Tuesday", time: "07:00 AM - 09:00 AM" }
        ]
    },
    {
        routeName: "Route 10",
        locations: ["New Road", "Bhatbhateni", "Pulchowk"],
        schedule: [
            { day: "Friday", time: "09:30 AM - 11:30 AM" },
            { day: "Monday", time: "08:00 AM - 10:00 AM" }
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