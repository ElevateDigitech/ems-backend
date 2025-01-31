const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { auditActions, auditCollections } = require("../utils/audit");

const opts = {
  toJSON: { virtuals: true },
  id: 0,
};

const timeNow = moment().valueOf();

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
    },
    changes: {
      type: String,
      required: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
    },
    user: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    timeStamp: {
      type: Date,
      default: () => timeNow,
      immutable: true,
    },
  },
  opts
);

auditSchema.virtual("timeStampIST").get(function () {
  return `${moment(this.timeStamp).valueOf()}`;
});

const AuditLog = mongoose.model("AuditLog", auditSchema);
module.exports = AuditLog;
