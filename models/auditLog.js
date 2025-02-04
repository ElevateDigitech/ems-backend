const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { auditActions, auditCollections } = require("../utils/audit");

const Schema = mongoose.Schema;
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const AuditSchema = new Schema(
  {
    auditCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    action: {
      type: String,
      enum: Object.values(auditActions),
      required: true,
      immutable: true,
    },
    collection: {
      type: String,
      enum: Object.values(auditCollections),
      required: true,
      immutable: true,
    },
    document: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    changes: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      immutable: true,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      immutable: true,
    },
    user: {
      type: Object,
      required: true,
      immutable: true,
    },
    createdAt: {
      type: Date,
      default: () => moment().valueOf(),
      immutable: true,
    },
  },
  defaultOptions
);

AuditSchema.virtual("createdAtEpochTimestamp").get(function () {
  return moment(this.createdAt).valueOf();
});

AuditSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const AuditLog = mongoose.model("AuditLog", AuditSchema);
module.exports = AuditLog;
