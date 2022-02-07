const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createon: {
    type: Date,
    default: Date.now
  },
});

UserSchema.pre('save', (next) => {
  console.log("Adding Timestamp")
  let now = Date.now()
   
  this.createon = now
  next() //Required to save the record
});

const User = mongoose.model("User", UserSchema);
module.exports = User;