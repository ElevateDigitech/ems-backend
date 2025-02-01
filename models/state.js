const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeNow = moment().valueOf();

const stateSchema = new Schema({
  stateCode: {
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
stateSchema.virtual("createdAtIST").get(function () {
  return `${moment(this.createdAt).valueOf()}`;
});

// Virtual for formatted "updatedAt"
stateSchema.virtual("updatedAtIST").get(function () {
  return `${moment(this.updatedAt).valueOf()}`;
});

// Pre-find middleware to sort results by _id descending
stateSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const State = mongoose.model("State", stateSchema);

module.exports = State;
