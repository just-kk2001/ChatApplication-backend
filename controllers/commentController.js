const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = new Comment({
      postId,
      userId,
      text
    });

    await comment.save();
    await comment.populate('userId');

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get comments for a post
exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate('userId')
      .populate('likes')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check authorization
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    if (text) comment.text = text;
    comment.updatedAt = Date.now();
    await comment.save();
    await comment.populate('userId');

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check authorization
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Remove comment from post
    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: commentId }
    });

    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like comment
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if already liked
    if (comment.likes.includes(userId)) {
      return res.status(400).json({ error: 'Already liked this comment' });
    }

    comment.likes.push(userId);
    await comment.save();
    await comment.populate('likes');

    res.json({
      message: 'Comment liked successfully',
      likes: comment.likes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unlike comment
exports.unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if liked
    if (!comment.likes.includes(userId)) {
      return res.status(400).json({ error: 'Comment not liked' });
    }

    comment.likes = comment.likes.filter(id => id.toString() !== userId);
    await comment.save();
    await comment.populate('likes');

    res.json({
      message: 'Comment unliked successfully',
      likes: comment.likes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
