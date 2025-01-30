const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
  permissionCode: {
    type: String,
    required: true,
    unique: true,
  },
  permissionName: {
    type: String,
    required: true,
  },
  permissionDescription: {
    type: String,
    required: false,
  },
});

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;
