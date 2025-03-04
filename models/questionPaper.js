const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
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
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    questions: [
      {
        question: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        questionNumber: {
          type: Number,
          required: true,
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
