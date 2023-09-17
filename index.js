const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
const authRoutes = require('./Routes/Auth');
const blogRoutes = require('./Routes/Blog');
const imageuploadRoutes = require('./Routes/imageUploadRoutes');

require('dotenv').config();
require('./db')
const User = require('./Models/UserSchema')
const cookieParser = require('cookie-parser');


app.use(bodyParser.json());
const allowedOrigins = ['http://localhost:3000']; // Add more origins as needed

// Configure CORS with credentials
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow credentials
    })
);
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);
app.use('/image', imageuploadRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'The API is working' });
});
app.get('/blogcategories', async (req, res) => {
    const blogCategories = [
        "Technology Trends",
        "Health and Wellness",
        "Travel Destinations",
        "Food and Cooking",
        "Personal Finance",
        "Career Development",
        "Parenting Tips",
        "Self-Improvement",
        "Home Decor and DIY",
        "Book Reviews",
        "Environmental Sustainability",
        "Fitness and Exercise",
        "Movie and TV Show Reviews",
        "Entrepreneurship",
        "Mental Health",
        "Fashion and Style",
        "Hobby and Crafts",
        "Pet Care",
        "Education and Learning",
        "Sports and Recreation"
    ];
    res.json(
        {
            message: 'Categories fetched successfully',
            categories: blogCategories
        }
    )
})



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

