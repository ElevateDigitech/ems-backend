const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  userCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
  },
});

userSchema.plugin(passportLocalMongoose);

userSchema.pre(/^find/, function (next) {
  this.sort({ _id: -1 });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
