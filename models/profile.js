const mongoose = require("mongoose");
const { removeIdsForSubSchemas } = require("../utils/helpers");
const Schema = mongoose.Schema;

const opts = {
  toJSON: { virtuals: true },
  id: 0,
};

const ImageSchema = new Schema(
  {
    url: String,
    filename: String,
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
    },
    addressLineTwo: {
      type: String,
      required: false,
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
      default: "",
    },
    twitter: {
      type: String,
      required: false,
      default: "",
    },
    facebook: {
      type: String,
      required: false,
      default: "",
    },
    instagram: {
      type: String,
      required: false,
      default: "",
    },
    websiteProtfolioUrl: {
      type: String,
      required: false,
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
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
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

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
