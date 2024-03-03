const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PomoSchema = new Schema(
  {
    UserID: {
      type: String,
      required: true,
    },
    addtasks: {
      type: Array,
      default: [],
    },
    finishtask: {
      type: Array,
      default: [],
    },
  },
  { collection: "Pomodoro", timestamps: true }
);

const Pomo = mongoose.model("Pomodoro", PomoSchema);

module.exports = Pomo;
