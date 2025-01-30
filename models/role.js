const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema(
  {
    roleCode: {
      type: String,
      required: true,
      unique: true,
    },
    roleName: {
      type: String,
      required: true,
    },
    roleDescription: {
      type: String,
      required: false,
    },
    roleAllowDeletion: {
      type: Boolean,
      required: true,
    },
    rolePermissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  }
);

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
