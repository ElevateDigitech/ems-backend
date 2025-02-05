const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const SubjectSchema = new Schema(
  {
    subjectCode: {
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
SubjectSchema.virtual("createdAtEpochTimestamp").get(function () {
  return moment(this.createdAt).valueOf();
});

SubjectSchema.virtual("updatedAtEpochTimestamp").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Pre-find middleware to sort results by _id descending
SubjectSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Subject = mongoose.model("Subject", SubjectSchema);
module.exports = Subject;
