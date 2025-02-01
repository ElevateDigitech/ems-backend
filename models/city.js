const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeNow = moment().valueOf();

const citySchema = new Schema({
  cityCode: {
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
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: "Country",
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
citySchema.virtual("createdAtIST").get(function () {
  return `${moment(this.createdAt).valueOf()}`;
});

// Virtual for formatted "updatedAt"
citySchema.virtual("updatedAtIST").get(function () {
  return `${moment(this.updatedAt).valueOf()}`;
});

// Pre-find middleware to sort results by _id descending
citySchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const City = mongoose.model("City", citySchema);

module.exports = City;
