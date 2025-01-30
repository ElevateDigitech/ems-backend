const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  stateCode: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  iso: {
    type: String,
    required: true,
    unique: true,
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: "Country",
  },
});

const State = mongoose.model("State", stateSchema);

module.exports = State;
