const express = require('express');
const router = require('./Routes/User');
require("dotenv").config();
const app = express();

app.listen((process.env.PORT),()=> console.log("Serner started"));










