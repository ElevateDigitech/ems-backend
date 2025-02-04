const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const ClassSchema = new Schema(
  {
    classCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    name: {
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
ClassSchema.virtual("createdAtEpochTimestamp").get(function () {
  return moment(this.createdAt).valueOf();
});

ClassSchema.virtual("updatedAtEpochTimestamp").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Pre-find middleware to sort results by _id descending
ClassSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Class = mongoose.model("Class", ClassSchema);
module.exports = Class;
