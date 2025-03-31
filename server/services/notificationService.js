const nodemailer = require('nodemailer');
const cron = require('node-cron');
const moment = require('moment');

const {sendMail} = require('../Controller/mail')
const VehicleRoute = require('../Model/vehicle');
const User = require('../Model/User');


// Function to check the schedule and send notifications
const checkScheduleAndSendNotifications = async () => {
    
    // Get all vehicle routes
    const vehicleRoutes = await VehicleRoute.find({});

    // Loop through each route and check if the time matches
    vehicleRoutes.forEach(async (vehicleRoute) => {
      const { routeName, schedule } = vehicleRoute;

      // Get the current day and time
      const currentDay = moment().format('dddd');  // e.g., 'Monday'
      const currentTime = moment().format('h:mm A');  // e.g., '10:00 AM'

      // Find today's schedule for the route
      const todaysSchedule = schedule.filter((entry) => entry.day === currentDay);

      if (todaysSchedule.length === 0) return; // No schedule for today

      // Loop through each schedule for today
      todaysSchedule.forEach(async (schedule) => {
        const [startTime, endTime] = schedule.time.split(' - ');
        console.log(startTime+"-"+endTime);
        
        const notificationTime = moment(startTime, 'h:mm A').subtract(15, 'minutes').format('h:mm A');
        console.log("Notification time>"+notificationTime)

        // Check if current time matches the notification time (15 minutes before the collection start time)
        if (currentTime === notificationTime) {
          console.log("here");
          
          // Find users who selected this route
          const usersToNotify = await User.find({ selectedRoute: vehicleRoute._id });
          console.log(usersToNotify)

          // Send notifications to all users
          usersToNotify.forEach((user) => {
            const message = `Dear ${user.name},\n\nThis is a reminder for your scheduled collection on ${currentDay} from ${startTime} to ${endTime}. Please be ready.\n\nBest regards,\n Waste Management System`;

            sendMail(user.email, 'Collection Notification', message);
          });
        }
      });
    });
 
};

// Cron job to run every minute
cron.schedule('* * * * *', () => {
  checkScheduleAndSendNotifications();
});

module.exports = {
  checkScheduleAndSendNotifications,
};
