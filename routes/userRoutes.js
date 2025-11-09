const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);

// Protected routes
router.put('/profile', auth, userController.updateProfile);
router.post('/:userId/follow', auth, userController.followUser);
router.post('/:userId/unfollow', auth, userController.unfollowUser);

module.exports = router;
