const express = require('express');
const User = require('./user.model');
const generateToken = require('../middleware/generateToken');
// const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body);
        if (!username || !email || !password) {
            return res.status(400).send({ message: "All fields are required" });
        }

        const user = new User({ email, username, password });
        await user.save();

        res.status(201).send({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error registering user", error);
        res.status(500).send({ message: "Error registering user" });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).send({ message: "Incorrect password" });
        }

        const token = await generateToken(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
        });

        res.status(200).send({
            message: "Logged in successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession,
            },
        });
    } catch (error) {
        console.error("Error logging in user", error);
        res.status(500).send({ message: "Error logging in user" });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send({ message: "Logged out successfully" });
});

// Delete a user endpoint
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user", error);
        res.status(500).send({ message: "Error deleting user" });
    }
});

// Get all users endpoint
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'id email role').sort({ createdAt: -1 });
        res.status(200).send(users);
    } catch (error) {
        console.error("Error fetching users", error);
        res.status(500).send({ message: "Error fetching users" });
    }
});

// Update user role endpoint
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).send({ message: "Role is required" });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error("Error updating user role", error);
        res.status(500).send({ message: "Error updating user role" });
    }
});

// Edit/update user profile endpoint
router.patch('/edit-profile', async (req, res) => {
    try {
        const { userId, username, profileImage, bio, profession } = req.body;

        if (!userId) {
            return res.status(400).send({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Update profile information
        if (username !== undefined) user.username = username;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (bio !== undefined) user.bio = bio;
        if (profession !== undefined) user.profession = profession;

        await user.save();
        res.status(200).send({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error updating user profile", error);
        res.status(500).send({ message: "Error updating user profile" });
    }
});

module.exports = router;
