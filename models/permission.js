const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
  permissionCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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
});

permissionSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;
