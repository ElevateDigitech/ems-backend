const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new Schema({
  classCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  className: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

classSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
