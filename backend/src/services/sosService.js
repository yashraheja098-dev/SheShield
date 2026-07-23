import SOSLog from "../models/SOSLog.js";
import Contact from "../models/Contact.js";
import SafePoint from "../models/SafePoint.js";
import { createNotification } from "./notificationService.js";
import { emitToUser } from "../utils/socket.js";

import User from "../models/User.js";

export const triggerSOS = async (userId, { latitude, longitude, audioUrl, videoUrl }, io = null) => {
  // 1. Create and save new SOS log
  const sosLog = new SOSLog({
    userId,
    latitude,
    longitude,
    audioUrl,
    videoUrl,
    status: "active"
  });

  await sosLog.save();

  // 2. Fetch user's trusted contacts
  const contacts = await Contact.find({ userId });
  // Fallback: If no one is explicitly marked as SOS contact, use up to 3 contacts
  let sosContacts = contacts.filter(c => c.isSOSContact);
  if (sosContacts.length === 0) {
    sosContacts = contacts.slice(0, 3);
  }

  // 3. Fetch nearest 5 safe points to recommend to the user
  const safePoints = await SafePoint.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude] // [lng, lat]
        }
      }
    }
  }).limit(5);

  // 4. Log notification for the user
  const contactList = sosContacts.map(c => `${c.name} (${c.relationship})`).join(", ");
  await createNotification(
    userId,
    {
      type: "sos",
      title: "SOS Alert Dispatched!",
      message: `Emergency SOS triggered at coordinates [${latitude}, ${longitude}]. Alerting: ${contactList || "No contacts configured"}.`
    },
    io
  );

  // 5. Notify SOS contacts if they are registered users
  const user = await User.findById(userId);
  for (const contact of sosContacts) {
    const contactUser = await User.findOne({ phone: contact.phone });
    if (contactUser) {
      await createNotification(
        contactUser._id,
        {
          type: "sos",
          title: `EMERGENCY: ${user.name} triggered SOS!`,
          message: `${user.name} triggered an SOS at [${latitude}, ${longitude}]. Please check on them immediately!`
        },
        io
      );
    }
  }

  // 6. Emit live alert over socket to user client room (for frontend SMS trigger)
  if (io) {
    emitToUser(io, userId, "sos-triggered", {
      sosLog,
      contacts: sosContacts,
      nearestSafePoints: safePoints
    });
  }

  return {
    sosLog,
    nearestSafePoints: safePoints,
    emergencyContacts: sosContacts
  };
};

export const resolveSOS = async (userId, sosId) => {
  const sosLog = await SOSLog.findOneAndUpdate(
    { _id: sosId, userId, status: "active" },
    { status: "resolved", resolvedAt: new Date() },
    { new: true }
  );

  if (!sosLog) {
    const error = new Error("Active SOS log not found.");
    error.statusCode = 404;
    throw error;
  }

  return sosLog;
};
