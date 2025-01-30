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
      default: () => `AUDIT_${timeNow}`,
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
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "collection",
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  // return moment(this.timeStamp)
  //   .tz("Asia/Kolkata")
  //   .format("YYYY-MM-DD HH:mm:ss");
  return `${moment(this.timeStamp).valueOf()}`;
});

const AuditLog = mongoose.model("AuditLog", auditSchema);
module.exports = AuditLog;
