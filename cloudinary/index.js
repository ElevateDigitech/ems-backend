const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const allowedFormats = ["jpg", "jpeg", "png", "svg", "webp", "avif"];

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER,
    allowed_formats: allowedFormats,
  },
});

module.exports = {
  cloudinary,
  storage,
  allowedFormats,
};
