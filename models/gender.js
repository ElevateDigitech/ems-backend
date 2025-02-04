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

// Virtuals for timestamps
GenderSchema.virtual("createdAtEpochTimestamp").get(function () {
  return moment(this.createdAt).valueOf();
});

GenderSchema.virtual("updatedAtEpochTimestamp").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Pre-find middleware to sort results by _id descending
GenderSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

// Create and export the model
const Gender = mongoose.model("Gender", GenderSchema);
module.exports = Gender;
