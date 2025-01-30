const multer = require("multer");
const { storage, allowedFormats } = require("../cloudinary");
const { STATUS_CODE_BAD_REQUEST } = require("../utils/statusCodes");
const ExpressResponse = require("../utils/ExpressResponse");
const { STATUS_ERROR } = require("../utils/status");
const { IMAGE_FIELD_PROFILE_PICTURE } = require("../utils/imageFields");

const commonConfigs = {
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB file size limit
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (allowedFormats?.some((img) => file.mimetype.includes(img))) {
      cb(null, true);
    } else {
      cb(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          `Only ${allowedFormats?.join(", ")} image files are allowed`
        )
      );
    }
  },
};
const uploadProfilePicture = multer({ ...commonConfigs }).single(
  IMAGE_FIELD_PROFILE_PICTURE
);

module.exports = {
  uploadProfilePicture,
};
