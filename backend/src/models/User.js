import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    profileImage: {
      type: String,
      default: ""
    },
    emergencyContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact"
      }
    ],
    journeyHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Journey"
      }
    ]
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);
export default User;
