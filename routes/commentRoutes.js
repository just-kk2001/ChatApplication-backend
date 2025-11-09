const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const { validateComment, handleValidationErrors } = require('../utils/validators');

// Public routes
router.get('/:postId', commentController.getPostComments);

// Protected routes
router.post('/:postId', auth, validateComment, handleValidationErrors, commentController.addComment);
router.put('/:commentId', auth, commentController.updateComment);
router.delete('/:commentId', auth, commentController.deleteComment);
router.post('/:commentId/like', auth, commentController.likeComment);
router.post('/:commentId/unlike', auth, commentController.unlikeComment);

module.exports = router;
