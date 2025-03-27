const express = require('express');
const userRoutes = require('./Routes/User');
const vehicleRoute = require('./Routes/vehicle')

require('dotenv').config();

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
