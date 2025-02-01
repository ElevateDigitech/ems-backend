const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeNow = moment().valueOf();

const permissionSchema = new Schema({
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
});

// Virtual for formatted "createdAt"
permissionSchema.virtual("createdAtIST").get(function () {
  return `${moment(this.createdAt).valueOf()}`;
});

// Virtual for formatted "updatedAt"
permissionSchema.virtual("updatedAtIST").get(function () {
  return `${moment(this.updatedAt).valueOf()}`;
});

// Pre-find middleware to sort results by _id descending
permissionSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;
