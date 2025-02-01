const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeNow = moment().valueOf();

const classSchema = new Schema({
  classCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    immutable: true,
  },
  className: {
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
});

// Virtual for formatted "createdAt"
classSchema.virtual("createdAtIST").get(function () {
  return `${moment(this.createdAt).valueOf()}`;
});

// Virtual for formatted "updatedAt"
classSchema.virtual("updatedAtIST").get(function () {
  return `${moment(this.updatedAt).valueOf()}`;
});

// Pre-find middleware to sort results by _id descending
classSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
