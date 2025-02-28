const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const QuestionSchema = new Schema(
  {
    questionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    level: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
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

const Question = mongoose.model("Question", QuestionSchema);
module.exports = Question;
