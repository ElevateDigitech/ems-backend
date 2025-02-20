const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const defaultOptions = {
  toJSON: { virtuals: true },
  id: false,
};

/** Role Schema */
const RoleSchema = new Schema(
  {
    roleCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    roleName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roleDescription: {
      type: String,
      trim: true,
    },
    roleAllowDeletion: {
      type: Boolean,
      required: true,
      immutable: true,
    },
    rolePermissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
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

const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
