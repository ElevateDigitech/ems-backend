const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  stateCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  iso: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: "Country",
  },
});

stateSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const State = mongoose.model("State", stateSchema);

module.exports = State;
