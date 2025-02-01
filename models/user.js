const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const timeNow = moment().valueOf();

const userSchema = new Schema({
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
userSchema.virtual("createdAtIST").get(function () {
  return `${moment(this.createdAt).valueOf()}`;
});

// Virtual for formatted "updatedAt"
userSchema.virtual("updatedAtIST").get(function () {
  return `${moment(this.updatedAt).valueOf()}`;
});

// Pre-find middleware to sort results by _id descending
userSchema.plugin(passportLocalMongoose);

userSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
