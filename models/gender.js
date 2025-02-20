const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const GenderSchema = new Schema(
  {
    genderCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    genderName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

const Gender = mongoose.model("Gender", GenderSchema);
module.exports = Gender;
