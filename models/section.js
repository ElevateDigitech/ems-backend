const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const SectionSchema = new Schema(
  {
    sectionCode: {
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
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
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

// Virtuals for timestamps
SectionSchema.virtual("createdAtIST").get(function () {
  return moment(this.createdAt).valueOf();
});

SectionSchema.virtual("updatedAtIST").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Pre-find middleware to sort results by _id descending
SectionSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Section = mongoose.model("Section", SectionSchema);
module.exports = Section;
