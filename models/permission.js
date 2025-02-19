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
  },
  defaultOptions
);

const Permission = mongoose.model("Permission", PermissionSchema);
module.exports = Permission;
