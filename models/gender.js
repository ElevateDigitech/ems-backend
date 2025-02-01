const mongoose = require("mongoose");
const moment = require("moment");
const { Schema } = mongoose;

const timeNow = moment().valueOf();

const genderSchema = new Schema({
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
});

// Virtual for formatted "createdAt"
genderSchema.virtual("createdAtIST").get(function () {
  return `${moment(this.createdAt).valueOf()}`;
});

// Virtual for formatted "updatedAt"
genderSchema.virtual("updatedAtIST").get(function () {
  return `${moment(this.updatedAt).valueOf()}`;
});

// Pre-find middleware to sort results by _id descending
genderSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

// Create and export the model
const Gender = mongoose.model("Gender", genderSchema);

module.exports = Gender;
