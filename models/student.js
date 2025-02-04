const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const StudentSchema = new Schema(
  {
    studentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
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
StudentSchema.virtual("createdAtEpochTimestamp").get(function () {
  return moment(this.createdAt).valueOf();
});

StudentSchema.virtual("updatedAtEpochTimestamp").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Pre-find middleware to sort results by _id descending
StudentSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
