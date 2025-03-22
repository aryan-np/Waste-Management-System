const express = require('express');
const userRoutes = require('./Routes/User');

require('dotenv').config();

const app = express();


// Import the connection function
const { connectToDatabase } = require('./database');  // Import the function correctly

// Call the connectToDatabase function
connectToDatabase();

app.use(express.json());
app.use('/api/user/', userRoutes);


app.listen(process.env.PORT, () => {
    console.log('Server started at port ' + process.env.PORT);
});
