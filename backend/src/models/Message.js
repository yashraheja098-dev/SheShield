import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true
    },
    roomId: {
      type: String, // We'll use the string roomId to link, or could use ObjectId ref="Room"
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // adds createdAt (timestamp) and updatedAt
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
