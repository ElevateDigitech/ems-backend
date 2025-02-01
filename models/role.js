const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  roleCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  roleName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  roleDescription: {
    type: String,
    required: false,
    trim: true,
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
});

roleSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
