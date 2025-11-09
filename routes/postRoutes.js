const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const { validatePost, handleValidationErrors } = require('../utils/validators');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.get('/user/:userId', postController.getUserPosts);

// Protected routes
router.post('/', auth, validatePost, handleValidationErrors, postController.createPost);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.post('/:id/like', auth, postController.likePost);
router.post('/:id/unlike', auth, postController.unlikePost);

module.exports = router;
