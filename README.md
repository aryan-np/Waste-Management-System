User Authentication API

This is a Node.js and Express-based API for user authentication, including user registration, login, and password reset functionality. The API uses MongoDB with Mongoose for data storage.

Features

User registration (Signup)

User authentication (Login)

Password reset (Forgot Password)

Technologies Used

Node.js

Express.js

MongoDB (via Mongoose)

dotenv (for environment variables)

Installation

Clone this repository:

git clone <repository-url>
cd <project-folder>

Install dependencies:

npm install

Create a .env file in the root directory and add the following environment variables:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/test

Start the server:

npm start

API Endpoints

User Routes

1. Signup

Endpoint: POST /api/user/signup

Request Body:

{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "password123"
}

Response:

{
  "message": "User registered successfully"
}

2. Login

Endpoint: POST /api/user/login

Request Body:

{
  "email": "johndoe@example.com",
  "password": "password123"
}

Response:

{
  "token": "jwt-token-here"
}

3. Forgot Password

Endpoint: POST /api/user/forgot-password

Request Body:

{
  "email": "johndoe@example.com"
}

Response:

{
  "message": "Password reset link sent to email"
}

Project Structure

.
├── Routes
│   ├── User.js
├── Controllers
│   ├── userController.js
├── database.js
├── server.js
├── .env
├── package.json
└── README.md

Running with Swagger Documentation

This project includes API documentation using Swagger.

Install Swagger UI Express:

npm install swagger-ui-express

Import and use Swagger in server.js:

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

Start the server and open http://localhost:5000/api-docs in a browser to view API documentation.

License

This project is licensed under the MIT License.

Contact

For any issues or contributions, feel free to create a pull request or open an issue!

