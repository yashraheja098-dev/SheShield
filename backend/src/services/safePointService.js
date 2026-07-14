import SafePoint from "../models/SafePoint.js";
import { getNearbyPlacesFromGoogle } from "./googleMapsService.js";

export const getLocalSafePoints = async ({ latitude, longitude, radius = 5000, category }) => {
  const categoriesToFetch = category ? [category] : ["Police Station", "Hospital", "Pharmacy", "Petrol Pump", "Women Help Centre"];
  let allGooglePoints = [];

  try {
    for (const cat of categoriesToFetch) {
      const places = await getNearbyPlacesFromGoogle(latitude, longitude, cat, radius);
      
      const mappedPlaces = places.map((place) => ({
        _id: place.place_id,
        name: place.name,
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
        category: cat,
        openStatus: place.business_status === "OPERATIONAL" ? "Open 24/7" : place.business_status,
        location: {
          type: "Point",
          coordinates: [place.geometry?.location?.lng, place.geometry?.location?.lat]
        }
      }));
      
      allGooglePoints = [...allGooglePoints, ...mappedPlaces];
    }
  } catch (error) {
    console.error("Error fetching from Google Places API, falling back to local DB:", error);
  }

  if (allGooglePoints.length > 0) {
    return allGooglePoints;
  }

  // Fallback to database
  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseInt(radius)
      }
    }
  };

  if (category) {
    query.category = category;
  }

  return await SafePoint.find(query);
};

export const createLocalSafePoint = async (safePointData) => {
  const newSafePoint = new SafePoint(safePointData);
  return await newSafePoint.save();
};
