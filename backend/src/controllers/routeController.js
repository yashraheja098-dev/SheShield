import { getRoutes } from "../services/googleMapsService.js";
import { decodePolyline } from "../utils/polylineDecoder.js";
import { calculateSafetyScore } from "../services/safetyScoreService.js";
import { successResponse } from "../utils/responseFormatter.js";

export const handleAnalyzeRoutes = async (req, res, next) => {
  try {
    const { origin, destination, travelMode } = req.body;

    if (!origin || !destination) {
      const error = new Error("Both origin and destination are required.");
      error.statusCode = 400;
      throw error;
    }

    // 1. Fetch routes from Google maps wrapper
    const rawRoutes = await getRoutes(origin, destination, travelMode || "WALK");

    // 2. Decode and analyze each route
    const analyzedRoutes = await Promise.all(
      rawRoutes.map(async (route) => {
        const polylineStr = route.polyline.encodedPolyline;
        const decodedCoords = decodePolyline(polylineStr);
        
        // Calculate safety score metrics
        const safetyResult = await calculateSafetyScore(decodedCoords);

        return {
          routeLabel: route.routeLabel || "Alternative Route",
          distance: route.distanceMeters,
          duration: route.duration,
          polyline: polylineStr,
          safetyScore: safetyResult.score,
          riskLevel: safetyResult.riskLevel,
          safetyExplanation: safetyResult.reasons
        };
      })
    );

    // 3. Rank routes by Safety Score descending (Safest first)
    analyzedRoutes.sort((a, b) => b.safetyScore - a.safetyScore);

    return successResponse(res, "Routes analyzed and ranked by safety successfully.", { routes: analyzedRoutes }, 200);
  } catch (error) {
    next(error);
  }
};
