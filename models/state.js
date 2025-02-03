const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const StateSchema = new Schema(
  {
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
  },
  defaultOptions
);

// Virtuals for formatted timestamps
StateSchema.virtual("createdAtIST").get(function () {
  return moment(this.createdAt).valueOf();
});

StateSchema.virtual("updatedAtIST").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Pre-find middleware to sort results by _id descending
StateSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const State = mongoose.model("State", StateSchema);
module.exports = State;
