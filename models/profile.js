const mongoose = require("mongoose");
const { removeIdsForSubSchemas } = require("../utils/helpers");
const Schema = mongoose.Schema;

const opts = {
  toJSON: { virtuals: true },
  id: 0,
};

const ImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { ...removeIdsForSubSchemas, ...opts }
);

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const AddressSchema = new Schema(
  {
    addressLineOne: {
      type: String,
      required: false,
      trim: true,
    },
    addressLineTwo: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    postalCode: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { ...removeIdsForSubSchemas, ...opts }
);

AddressSchema.virtual("fullAddress").get(function () {
  return `${
    this.addressLineOne
  }\n${this.addressLineTwo || ""}\n${this.city.name}, ${this.state.name ? this.state.name + "- " : ""}${this.postalCode}\n${this.country.name}`;
});

const SocialSchema = new Schema(
  {
    linkedin: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    twitter: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    facebook: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    instagram: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    websiteProtfolioUrl: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
  },
  removeIdsForSubSchemas
);

const NotificationsSchema = new Schema(
  {
    email: {
      type: Boolean,
      required: true,
      default: false,
    },
    sms: {
      type: Boolean,
      required: true,
      default: false,
    },
    push: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  removeIdsForSubSchemas
);

const profileSchema = new Schema({
  profileCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
  },
  profilePicture: {
    type: ImageSchema,
    required: true,
  },
  dob: {
    type: Date,
    validate: {
      validator: function (value) {
        return value <= Date.now();
      },
      message: "Date of Birth cannot be a future Date",
    },
  },
  gender: {
    type: Schema.Types.ObjectId,
    ref: "Gender",
  },
  phoneNumber: {
    type: String,
    required: false,
    unique: true,
    trim: true,
  },
  address: { type: AddressSchema },
  social: { type: SocialSchema },
  notification: { type: NotificationsSchema },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
});

profileSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
