const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const citySchema = new Schema({
  cityCode: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: "Country",
  },
});

const City = mongoose.model("City", citySchema);

module.exports = City;
