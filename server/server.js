const express = require('express');
const userRoutes = require('./Routes/User');
const vehicleRoute = require('./Routes/vehicle')
const cors = require('cors');
require('dotenv').config();
const cookieParser = require("cookie-parser");
const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('./services/notificationService');


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cookieParser());

app.use(cors({
    origin: 'http://127.0.0.1:5500',  // Your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,  // Allow credentials to be included in the request
}));

// Import the connection function
const { connectToDatabase } = require('./database');  // Import the function correctly

// Call the connectToDatabase function
connectToDatabase();

app.use(express.json());
app.use('/api/user/', userRoutes);
app.use('/api/routes/',vehicleRoute);


const billRoutes = require('./Routes/billRoutes');
app.use('/api/bill/', billRoutes);



app.listen(process.env.PORT, () => {
    console.log('Server started at port ' + process.env.PORT);
});
