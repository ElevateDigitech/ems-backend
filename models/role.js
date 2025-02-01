const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeNow = moment().valueOf();

const roleSchema = new Schema({
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
    required: false,
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
});

// Virtual for formatted "createdAt"
roleSchema.virtual("createdAtIST").get(function () {
  return `${moment(this.createdAt).valueOf()}`;
});

// Virtual for formatted "updatedAt"
roleSchema.virtual("updatedAtIST").get(function () {
  return `${moment(this.updatedAt).valueOf()}`;
});

// Pre-find middleware to sort results by _id descending
roleSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
