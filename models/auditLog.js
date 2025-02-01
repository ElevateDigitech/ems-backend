const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { auditActions, auditCollections } = require("../utils/audit");

const opts = {
  toJSON: { virtuals: true },
  id: 0,
};

const auditSchema = new mongoose.Schema(
  {
    auditCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    action: {
      type: String,
      enum: Object.values(auditActions),
      required: true,
    },
    collection: {
      type: String,
      enum: Object.values(auditCollections),
      required: true,
    },
    document: {
      type: String,
      required: true,
      trim: true,
    },
    changes: {
      type: String,
      required: true,
      trim: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
    },
    user: {
      type: Object,
      required: true,
    },
    timeStamp: {
      type: Date,
      default: () => moment().valueOf(),
      immutable: true,
    },
  },
  opts
);

auditSchema.virtual("timeStampIST").get(function () {
  return `${moment(this.timeStamp).valueOf()}`;
});

auditSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const AuditLog = mongoose.model("AuditLog", auditSchema);
module.exports = AuditLog;
