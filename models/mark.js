const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = () => moment().valueOf();
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
    questionPaper: {
      type: Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
    marksPerQuestion: {
      type: [{ type: Number, required: true }],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.every((num) => !Number.isNaN(parseFloat(num))),
        message: "Invalid marks per question",
      },
    },
    markEarned: {
      type: Number,
      required: true,
      validate: {
        validator: (num) => !Number.isNaN(parseFloat(num)),
        message: "Invalid marks earned",
      },
    },
    markTotal: {
      type: Number,
      required: true,
      validate: {
        validator: (num) => !Number.isNaN(parseFloat(num)),
        message: "Invalid total marks",
      },
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
