const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (base64Image) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'social-media',
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Image upload failed: ' + error.message);
  }
};

const deleteImage = async (imageUrl) => {
  try {
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`social-media/${publicId}`);
  } catch (error) {
    console.error('Image deletion failed:', error.message);
  }
};

module.exports = { uploadImage, deleteImage };
