const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

// Create post
exports.createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const userId = req.userId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Post text is required' });
    }

    const post = new Post({
      userId,
      text,
      image: null
    });

    // Upload image if provided
    if (image) {
      post.image = await uploadImage(image);
    }

    await post.save();
    await post.populate('userId');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId')
      .populate({
        path: 'comments',
        populate: { path: 'userId' }
      })
      .populate('likes')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId')
      .populate({
        path: 'comments',
        populate: { path: 'userId' }
      })
      .populate('likes');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ userId })
      .populate('userId')
      .populate({
        path: 'comments',
        populate: { path: 'userId' }
      })
      .populate('likes')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check authorization
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    // Update text
    if (text) post.text = text;

    // Handle image update
    if (image) {
      // Delete old image if exists
      if (post.image) {
        await deleteImage(post.image);
      }
      post.image = await uploadImage(image);
    }

    post.updatedAt = Date.now();
    await post.save();
    await post.populate('userId');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check authorization
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete image if exists
    if (post.image) {
      await deleteImage(post.image);
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ postId });

    await Post.findByIdAndDelete(postId);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like post
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    if (post.likes.includes(userId)) {
      return res.status(400).json({ error: 'Already liked this post' });
    }

    post.likes.push(userId);
    await post.save();
    await post.populate('likes');

    res.json({
      message: 'Post liked successfully',
      likes: post.likes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unlike post
exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if liked
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ error: 'Post not liked' });
    }

    post.likes = post.likes.filter(id => id.toString() !== userId);
    await post.save();
    await post.populate('likes');

    res.json({
      message: 'Post unliked successfully',
      likes: post.likes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
