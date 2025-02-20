const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const ExamSchema = new Schema(
  {
    examCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    title: {
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

const Exam = mongoose.model("Exam", ExamSchema);
module.exports = Exam;
