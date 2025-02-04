const mongoose = require("mongoose");
const moment = require("moment");
const { removeIdsForSubSchemas } = require("../utils/helpers");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

/** Image Schema */
const ImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    ...removeIdsForSubSchemas,
    ...defaultOptions,
  }
);

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

/** Address Schema */
const AddressSchema = new Schema(
  {
    addressLineOne: {
      type: String,
      trim: true,
    },
    addressLineTwo: {
      type: String,
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
  {
    ...removeIdsForSubSchemas,
    ...defaultOptions,
  }
);

AddressSchema.virtual("fullAddress").get(function () {
  return [
    this.addressLineOne,
    this.addressLineTwo,
    `${this.city?.name}, ${this.state?.name ? this.state.name + "- " : ""}${
      this.postalCode
    }`,
    this.country?.name,
  ]
    .filter(Boolean)
    .join("\n");
});

/** Social Schema */
const SocialSchema = new Schema(
  {
    linkedin: {
      type: String,
      trim: true,
      default: "",
    },
    twitter: {
      type: String,
      trim: true,
      default: "",
    },
    facebook: {
      type: String,
      trim: true,
      default: "",
    },
    instagram: {
      type: String,
      trim: true,
      default: "",
    },
    websiteProtfolioUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  removeIdsForSubSchemas
);

/** Notifications Schema */
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

/** Profile Schema */
const ProfileSchema = new Schema(
  {
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
      trim: true,
    },
    profilePicture: {
      type: ImageSchema,
    },
    dob: {
      type: Date,
      validate: {
        validator: (value) => value <= Date.now(),
        message: "Date of Birth cannot be a future date",
      },
      required: true,
    },
    gender: {
      type: Schema.Types.ObjectId,
      ref: "Gender",
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    address: {
      type: AddressSchema,
    },
    social: {
      type: SocialSchema,
    },
    notification: {
      type: NotificationsSchema,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    createdAt: {
      type: Date,
      default: timeNow,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: timeNow,
    },
  },
  defaultOptions
);

/** Virtuals for Formatted Dates */
ProfileSchema.virtual("createdAtEpochTimestamp").get(function () {
  return moment(this.createdAt).valueOf();
});

ProfileSchema.virtual("updatedAtEpochTimestamp").get(function () {
  return moment(this.updatedAt).valueOf();
});

/** Pre-find Middleware to Sort by Latest */
ProfileSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Profile = mongoose.model("Profile", ProfileSchema);
module.exports = Profile;
