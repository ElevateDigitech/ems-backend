const mongoose = require("mongoose");
const moment = require("moment");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const timeNow = moment().valueOf();
const UserSchema = new Schema(
  {
    userCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userAllowDeletion: {
      type: Boolean,
      required: true,
      immutable: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
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
  { toJSON: { virtuals: true }, id: false }
);

// Virtuals for formatted timestamps
UserSchema.virtual("createdAtEpochTimestamp").get(function () {
  return moment(this.createdAt).valueOf();
});

UserSchema.virtual("updatedAtEpochTimestamp").get(function () {
  return moment(this.updatedAt).valueOf();
});

// Middleware for sorting by latest entries
UserSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

// Plugin for authentication
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);
module.exports = User;
