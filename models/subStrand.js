const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = () => moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const SubStrandSchema = new Schema(
  {
    subStrandCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    strand: {
      type: Schema.Types.ObjectId,
      ref: "Strand",
      required: true,
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

const SubStrand = mongoose.model("SubStrand", SubStrandSchema);
module.exports = SubStrand;
