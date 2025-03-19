const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WasteManagement')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));
