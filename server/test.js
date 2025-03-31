// const nodemailer = require('nodemailer');
// const cron = require('node-cron');
const moment = require('moment');
const VehicleRoute = require('./Model/vehicle');
const User = require('./Model/User');

// // Set up Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,   // Your email (set it in .env)
//     pass: process.env.EMAIL_PASS,   // Your email password or app-specific password (set in .env)
//   },
// });

// // Helper function to send email
// const sendEmailNotification = (to, subject, text) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//   };

//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.error('Error sending email:', err);
//     } else {
//       console.log('Email sent:', info.response);
//     }
//   });
// };

const { connectToDatabase } = require('./database');  // Import the function correctly

// Call the connectToDatabase function
connectToDatabase();

// // Function to check the schedule and send notifications
const checkScheduleAndSendNotifications = async () => {

    // Get all vehicle routes
    const vehicleRoutes = await VehicleRoute.find({});

    // Loop through each route and check if the time matches
    vehicleRoutes.forEach(async (vehicleRoute) => {
      const { routeName, schedule } = vehicleRoute;

      // Get the current day and time
      const currentDay = moment().format('dddd');  // e.g., 'Monday'
      const currentTime = moment().format('h:mm A');  // e.g., '10:00 AM'
    //   console.log(schedule)
      // Find today's schedule for the route
      const todaysSchedule = schedule.filter((entry) => entry.day === currentDay);
    //   console.log("\n\n\n\n\n");
      
    //   console.log(todaysSchedule);
      

      if (todaysSchedule.length === 0) return; // No schedule for today

      // Loop through each schedule for today
      todaysSchedule.forEach(async (schedule) => {
        const [startTime, endTime] = schedule.time.split(' - ');
        const notificationTime = moment(startTime, 'h:mm A').subtract(15, 'minutes').format('h:mm A');

        // Check if current time matches the notification time (15 minutes before the collection start time)
        // if (currentTime === notificationTime) {
          // Find users who selected this route
          const usersToNotify = await User.find({ selectedRoute: vehicleRoute._id });
          console.log(usersToNotify)

          // Send notifications to all users
         
    // }
});
});

};
checkScheduleAndSendNotifications();

// // Cron job to run every minute
// cron.schedule('* * * * *', () => {
//   checkScheduleAndSendNotifications();
// });

// module.exports = {
//   checkScheduleAndSendNotifications,
// };
