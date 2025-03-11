const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = () => moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const QuestionPaperSchema = new Schema(
  {
    questionPaperCode: {
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
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    questions: [
      {
        questionNumber: {
          type: Number,
          required: true,
        },
        question: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        topicOfFocus: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
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

const QuestionPaper = mongoose.model("QuestionPaper", QuestionPaperSchema);
module.exports = QuestionPaper;
