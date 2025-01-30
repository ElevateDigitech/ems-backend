const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const genderSchema = new Schema({
  genderCode: {
    type: String,
    required: true,
    unique: true,
  },
  genderName: {
    type: String,
    required: true,
  },
});

const Gender = mongoose.model("Gender", genderSchema);

module.exports = Gender;
