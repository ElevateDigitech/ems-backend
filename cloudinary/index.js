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
    folder: "backend-starter-mongo-express",
    allowedFormats: allowedFormats,
  },
});

module.exports = {
  cloudinary,
  storage,
  allowedFormats,
};
