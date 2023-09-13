const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
const authRoutes = require('./Routes/Auth');
require('dotenv').config();
require('./db')
const User = require('./Models/UserSchema')


app.use(bodyParser.json());
app.use(cors());
app.use('/auth', authRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'The API is working' });
});




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

