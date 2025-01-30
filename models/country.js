const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countrySchema = new Schema({
  countryCode: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  iso2: {
    type: String,
    required: true,
    unique: true,
  },
  iso3: {
    type: String,
    required: true,
    unique: true,
  },
});

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
