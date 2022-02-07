const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date_sent: {
    type: Date,
    default: Date.now
  },
});

GroupMessageSchema.pre('save', (next) => {
  console.log("Adding Timestamp")
  let now = Date.now()
   
  this.date_sent = now
  next() //Required to save the record
});


const GroupMessage = mongoose.model("GroupMessage", GroupMessageSchema);
module.exports = GroupMessage;