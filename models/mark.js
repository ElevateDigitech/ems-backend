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
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
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

const Mark = mongoose.model("Mark", MarkSchema);
module.exports = Mark;
