const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const MarkSchema = new Schema(
  {
    markCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    markEarned: {
      type: String,
      required: true,
      trim: true,
    },
    markTotal: {
      type: String,
      required: true,
      trim: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
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
MarkSchema.virtual("createdAtIST").get(function () {
  return moment(this.createdAt).valueOf();
});

MarkSchema.virtual("updatedAtIST").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Pre-find middleware to sort results by _id descending
MarkSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Mark = mongoose.model("Mark", MarkSchema);
module.exports = Mark;
