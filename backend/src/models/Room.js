import mongoose from "mongoose";

const roomMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  travelMode: {
    type: String,
    enum: ["WALK", "BICYCLE", "DRIVE", "Any"],
    default: "WALK"
  },
  travellingToday: {
    type: Boolean,
    default: false
  },
  reachedSafely: {
    type: Boolean,
    default: false
  }
});

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    startLocation: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      default: "Daily"
    },
    preferredTime: {
      type: String
    },
    preferredTravelMode: {
      type: String,
      default: "Any"
    },
    meetingPoint: {
      type: String
    },
    reason: {
      type: String
    },
    safeScore: {
      type: Number,
      default: 0
    },
    members: [roomMemberSchema],
    activeTravellers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
