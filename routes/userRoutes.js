// routes/userRoutes.js
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getCurrentUser, updateUserProfile } = require('../controllers/userController');
const User = require('../models/user'); 
const router = express.Router();

router.get('/me', authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateUserProfile);

router.put("/interests", authMiddleware, async (req, res) => {
  try {
    const { interest } = req.body;
    if (!interest) return res.status(400).json({ error: "Interest is required" });

    const user = await User.findById(req.user.id); 
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!Array.isArray(user.interests)) user.interests = [];
    user.interests.push(interest);
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
