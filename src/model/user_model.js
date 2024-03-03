const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    kullaniciadi: {
      type: String,
      required: [true, "Kullanıcı adı boş olamaz"],
      trim: true,
      minlength: 2,
      maxlength: 25,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    emailAktif: {
      type: Boolean,
      default: false,
    },
    sifre: {
      type: String,
      required: true,
      trim: true,
    },
    totaltaskcount: {
      type: Number,
      default: 0,
    },
    finishtaskcount: {
      type: Number,
      default: 0,
    },
    continuetaskcount: {
      type: Number,
      default: 0,
    },
    finishtasktime: {
      type: Number,
      default: 0,
    },
    continuetasktime: {
      type: Number,
      default: 0,
    },
  },
  { collection: "kullanicilar", timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
