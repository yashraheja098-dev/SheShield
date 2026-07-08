import Journey from "../models/Journey.js";
import SafePoint from "../models/SafePoint.js";
import User from "../models/User.js";
import { getMinDistanceToPolyline } from "../utils/distanceCalculator.js";
import { createNotification } from "./notificationService.js";
import { emitToJourney } from "../utils/socket.js";

import Contact from "../models/Contact.js";

export const startJourney = async (userId, { origin, destination, selectedRoute }, io = null) => {
  // 1. Auto-complete or cancel any existing active journeys for this user
  await Journey.updateMany(
    { userId, status: "active" },
    { status: "cancelled" }
  );

  // 2. Create new Journey
  const newJourney = new Journey({
    userId,
    origin,
    destination,
    selectedRoute,
    currentLocation: {
      latitude: selectedRoute.coordinates?.length > 0 ? selectedRoute.coordinates[0][0] : 0,
      longitude: selectedRoute.coordinates?.length > 0 ? selectedRoute.coordinates[0][1] : 0
    },
    locationHistory: [
      {
        latitude: selectedRoute.coordinates?.length > 0 ? selectedRoute.coordinates[0][0] : 0,
        longitude: selectedRoute.coordinates?.length > 0 ? selectedRoute.coordinates[0][1] : 0
      }
    ]
  });

  await newJourney.save();

  // 3. Add reference to User
  const user = await User.findByIdAndUpdate(userId, {
    $push: { journeyHistory: newJourney._id }
  });

  // 4. Create notification for the user
  await createNotification(
    userId,
    {
      type: "journey",
      title: "Journey Started",
      message: `Your journey from ${origin} to ${destination} has started.`
    },
    io
  );

  // 5. Notify Primary Contact
  const primaryContact = await Contact.findOne({ userId, isPrimaryContact: true });
  if (primaryContact) {
    const contactUser = await User.findOne({ phone: primaryContact.phone });
    if (contactUser) {
      await createNotification(
        contactUser._id,
        {
          type: "journey",
          title: `${user.name} started a Journey`,
          message: `${user.name} is traveling from ${origin} to ${destination}. Track them live: /track/${newJourney._id}`
        },
        io
      );
    }
  }

  return newJourney;
};

export const updateLocation = async (userId, { latitude, longitude }, io = null) => {
  // 1. Find active journey
  const journey = await Journey.findOne({ userId, status: "active" });
  if (!journey) {
    const error = new Error("No active journey found for this user.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Update current location and append to history
  journey.currentLocation = { latitude, longitude };
  journey.locationHistory.push({ latitude, longitude, timestamp: new Date() });

  // 3. Deviation Detection
  // Min distance from current location to polyline path coordinates
  const distance = getMinDistanceToPolyline(
    [latitude, longitude],
    journey.selectedRoute.coordinates
  );

  let deviationAlert = null;
  const DEVIATION_THRESHOLD_METERS = 250; // Updated to 250m per spec

  if (distance > DEVIATION_THRESHOLD_METERS) {
    console.log(`Route deviation detected! User is ${distance} meters away.`);
    
    // Find nearest Safe Point from MongoDB
    const nearestSP = await SafePoint.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude] // [lng, lat]
          }
        }
      }
    });

    let nearestSafePointLog = null;
    if (nearestSP) {
      nearestSafePointLog = {
        name: nearestSP.name,
        latitude: nearestSP.latitude,
        longitude: nearestSP.longitude,
        category: nearestSP.category
      };
    }

    // Add to deviation logs
    journey.deviationLogs.push({
      latitude,
      longitude,
      distance,
      nearestSafePoint: nearestSafePointLog
    });

    const spText = nearestSP 
      ? ` Nearest safe point is ${nearestSP.name} (${nearestSP.category}).`
      : "";
    const warningMsg = `Route deviation detected! You are ${Math.round(distance)}m off-route.${spText}`;

    // Create system alert notification
    await createNotification(
      userId,
      {
        type: "deviation",
        title: "Deviation Alert!",
        message: warningMsg
      },
      io
    );

    deviationAlert = {
      message: warningMsg,
      distance,
      nearestSafePoint: nearestSafePointLog
    };

    // Emit live alert over Socket to the user room
    if (io) {
      io.to(journey._id.toString()).emit("route-deviation", deviationAlert);
    }
  }

  await journey.save();

  // 4. Broadcast live coordinates to journey room (for contacts tracking the user)
  if (io) {
    emitToJourney(io, journey._id, "location-update", {
      journeyId: journey._id,
      currentLocation: journey.currentLocation,
      deviationAlert
    });
  }

  return { journey, deviationAlert };
};

export const completeJourney = async (userId, io = null) => {
  const journey = await Journey.findOne({ userId, status: "active" });
  if (!journey) {
    const error = new Error("No active journey found to complete.");
    error.statusCode = 404;
    throw error;
  }

  journey.status = "completed";
  await journey.save();

  // Create notification
  await createNotification(
    userId,
    {
      type: "journey",
      title: "Journey Completed",
      message: `Your journey to ${journey.destination} has been successfully completed.`
    },
    io
  );

  // Broadcast completion to contacts in the journey room
  if (io) {
    emitToJourney(io, journey._id, "journey-completed", {
      journeyId: journey._id
    });
  }

  return journey;
};

export const getJourneyHistory = async (userId) => {
  return await Journey.find({ userId }).sort({ createdAt: -1 });
};
