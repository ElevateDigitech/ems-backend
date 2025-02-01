const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countrySchema = new Schema({
  countryCode: {
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
  iso2: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  iso3: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

countrySchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
