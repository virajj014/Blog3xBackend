const express = require('express');
const router = express.Router();
const Blog = require('../Models/BlogSchema');
const User = require('../Models/UserSchema');
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');


function createResponse(ok, message, data) {
    return {
      ok,
      message,
      data,
    };
  }

  const checkBlogOwnership = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json(createResponse(false, 'Blog post not found'));
        }

        if (blog.owner.toString() !== req.userId) {
            return res.status(403).json(createResponse(false, 'Permission denied: You do not own this blog'));
        }

        req.blog = blog;
        next();
    } catch (err) {
        res.status(500).json(createResponse(false, err.message));
    }
};
// c r u d  search

  
router.get('/test', authTokenHandler, async (req, res) => {
    res.json(createResponse(true, 'Test API works for blogs'));
});

// Create a new blog post
router.post('/', authTokenHandler, async (req, res) => {
    try {
        const { title, description, imageUrl, paragraphs, category } = req.body;
        console.log(title, description, imageUrl, paragraphs,category )
        const blog = new Blog({ title, description,imageUrl, paragraphs, owner: req.userId, category });
        await blog.save();

        // Add the blog post to the user's blogs array
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }

        user.blogs.push(blog._id);
        await user.save();

        res.status(201).json(createResponse(true, 'Blog post created successfully', { blog }));
    } catch (err) {
      console.log(err);
        res.status(500).json(createResponse(false, err.message));
    }
});

// Get all blog posts
router.get('/', async (req, res) => {
    try {
        const search = req.body.search || ''; // Default to an empty string if 'search' is not provided
        const page = parseInt(req.body.page) || 1; // Default to page 1 if 'page' is not provided or is invalid
        const perPage = 10; // Number of blogs per page

        // Build the search query using regular expressions for case-insensitive search
        const searchQuery = new RegExp(search, 'i');

        // Count the total number of blogs that match the search query
        const totalBlogs = await Blog.countDocuments({ title: searchQuery });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalBlogs / perPage);

        // Ensure 'page' is within valid range
        if (page < 1 || page > totalPages) {
            return res.status(400).json(createResponse(false, 'Invalid page number'));
        }

        // Calculate the number of blogs to skip
        const skip = (page - 1) * perPage;

        // Fetch the blogs that match the search query for the specified page
        const blogs = await Blog.find({ title: searchQuery })
            .sort({ createdAt: -1 }) // Sort by the latest blogs
            .skip(skip)
            .limit(perPage);

        res.status(200).json(createResponse(true, 'Blogs fetched successfully', { blogs, totalPages, currentPage: page }));
    } catch (err) {
        res.status(500).json(createResponse(false, err.message));
    }
});

// Get a specific blog post by ID
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json(createResponse(false, 'Blog post not found'));
        }
        res.status(200).json(createResponse(true, 'Blog fetched successfully', { blog }));
    } catch (err) {
        res.status(500).json(createResponse(false, err.message));
    }
});

// Update a specific blog post by ID
router.put('/:id', authTokenHandler, checkBlogOwnership, async (req, res) => {
    try {
        const { title, description, imageUrl, paragraphs, category } = req.body;
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, description, imageUrl, paragraphs, category },
            { new: true }
        );

        if (!updatedBlog) {
            return res.status(404).json(createResponse(false, 'Blog post not found'));
        }

        res.status(200).json(createResponse(true, 'Blog post updated successfully', { updatedBlog }));
    } catch (err) {
        res.status(500).json(createResponse(false, err.message));
    }
});

// Delete a specific blog post by ID
router.delete('/:id', authTokenHandler, checkBlogOwnership, async (req, res) => {
    try {
        // Find the blog post by ID and delete it
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

        if (!deletedBlog) {
            return res.status(404).json(createResponse(false, 'Blog post not found'));
        }

        // Remove the deleted blog ID from the user's blogs array
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }

        const blogIndex = user.blogs.indexOf(req.params.id);
        if (blogIndex !== -1) {
            user.blogs.splice(blogIndex, 1);
            await user.save();
        }

        res.status(200).json(createResponse(true, 'Blog post deleted successfully'));
    } catch (err) {
        res.status(500).json(createResponse(false, err.message));
    }
});

module.exports = router;
