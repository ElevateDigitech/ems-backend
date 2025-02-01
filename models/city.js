const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const citySchema = new Schema({
  cityCode: {
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
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: "Country",
  },
});

citySchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const City = mongoose.model("City", citySchema);

module.exports = City;
