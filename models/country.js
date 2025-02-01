const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeNow = moment().valueOf();

const countrySchema = new Schema({
  countryCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    immutable: true,
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
countrySchema.virtual("createdAtIST").get(function () {
  return `${moment(this.createdAt).valueOf()}`;
});

// Virtual for formatted "updatedAt"
countrySchema.virtual("updatedAtIST").get(function () {
  return `${moment(this.updatedAt).valueOf()}`;
});

// Pre-find middleware to sort results by _id descending
countrySchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
