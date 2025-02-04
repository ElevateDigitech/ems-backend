const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

const PermissionSchema = new Schema(
  {
    permissionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    permissionName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permissionDescription: {
      type: String,
      required: false,
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
  },
  defaultOptions
);

// Virtuals for timestamps
PermissionSchema.virtual("createdAtEpochTimestamp").get(function () {
  return moment(this.createdAt).valueOf();
});

PermissionSchema.virtual("updatedAtEpochTimestamp").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Pre-find middleware to sort results by _id descending
PermissionSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Permission = mongoose.model("Permission", PermissionSchema);
module.exports = Permission;
