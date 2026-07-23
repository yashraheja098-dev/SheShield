import axios from "axios";

/**
 * Encodes a list of [lat, lng] coordinates into a Google Maps Polyline string.
 * Used by the mock routes generator.
 */
const encodePolyline = (points) => {
  let result = [];
  let prevLat = 0,
    prevLng = 0;

  const encodeValue = (value) => {
    let val = Math.round(value * 1e5);
    val = val < 0 ? ~(val << 1) : val << 1;
    let s = "";
    while (val >= 0x20) {
      s += String.fromCharCode(((val & 0x1f) | 0x20) + 63);
      val >>= 5;
    }
    s += String.fromCharCode(val + 63);
    return s;
  };

  for (let p of points) {
    result.push(encodeValue(p[0] - prevLat));
    result.push(encodeValue(p[1] - prevLng));
    prevLat = p[0];
    prevLng = p[1];
  }
  return result.join("");
};

/**
 * Geocodes an address string into latitude/longitude.
 */
export const geocodeAddress = async (address) => {
  if (typeof address === "object" && address.latitude && address.longitude) {
    return {
      latitude: parseFloat(address.latitude),
      longitude: parseFloat(address.longitude)
    };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
    console.warn("Google Maps API Key is missing. Using mock geocoding.");
    // Default mock coordinates (New Delhi Connaught Place area)
    return { latitude: 28.6304, longitude: 77.2177 };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.status !== "OK" || !response.data.results.length) {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }
    const location = response.data.results[0].geometry.location;
    return { latitude: location.lat, longitude: location.lng };
  } catch (error) {
    console.error("Geocoding Error:", error.message);
    throw error;
  }
};

const generateRealisticPath = (start, end, numWaypoints, maxDeviation, biasMultiplier) => {
  const points = [[start.latitude, start.longitude]];
  const dx = end.latitude - start.latitude;
  const dy = end.longitude - start.longitude;
  const totalDist = Math.sqrt(dx * dx + dy * dy);
  
  if (totalDist === 0) {
    points.push([end.latitude, end.longitude]);
    return points;
  }
  
  const perpX = -dy / totalDist;
  const perpY = dx / totalDist;
  
  let currentOffset = 0;
  
  for (let i = 1; i <= numWaypoints; i++) {
    const t = i / (numWaypoints + 1); 
    
    const baseLat = start.latitude + dx * t;
    const baseLng = start.longitude + dy * t;
    
    // Envelope ensures we converge at start and end
    const envelope = Math.sin(t * Math.PI);
    
    // Bias pushes the route to one side to create distinct alternatives
    const bias = biasMultiplier * totalDist * envelope;
    
    // Random walk for road-like jaggedness
    const step = (Math.random() - 0.5) * (totalDist * 0.15);
    currentOffset += step;
    
    // Clamp offset to prevent wildly erratic paths
    const maxOffset = maxDeviation * totalDist;
    if (currentOffset > maxOffset) currentOffset = maxOffset;
    if (currentOffset < -maxOffset) currentOffset = -maxOffset;
    
    const finalOffset = (currentOffset * 0.6) + bias;
    
    points.push([
      baseLat + perpX * finalOffset,
      baseLng + perpY * finalOffset
    ]);
  }
  
  points.push([end.latitude, end.longitude]);
  return points;
};

const generateMockRoutes = (start, end) => {
  // Route 1: Fastest (mostly direct, small deviations, 10 waypoints)
  const route1Points = generateRealisticPath(start, end, 10, 0.1, 0.05);
  
  // Route 2: Safe Alternative (pushes noticeably to one side, 14 waypoints)
  const route2Points = generateRealisticPath(start, end, 14, 0.2, 0.3);

  // Route 3: Longer Path (pushes to the opposite side, 18 waypoints)
  const route3Points = generateRealisticPath(start, end, 18, 0.3, -0.4);

  return [
    {
      distanceMeters: 2500,
      duration: "600s",
      polyline: { encodedPolyline: encodePolyline(route1Points) },
      routeLabel: "Fastest Route",
      isMock: true
    },
    {
      distanceMeters: 2900,
      duration: "750s",
      polyline: { encodedPolyline: encodePolyline(route2Points) },
      routeLabel: "Safe Alternative Route",
      isMock: true
    },
    {
      distanceMeters: 3400,
      duration: "900s",
      polyline: { encodedPolyline: encodePolyline(route3Points) },
      routeLabel: "Longer Path",
      isMock: true
    }
  ];
};

/**
 * Fetches multiple routes from Google Routes API.
 */
export const getRoutes = async (origin, destination, travelMode = "WALK") => {
  const start = await geocodeAddress(origin);
  const end = await geocodeAddress(destination);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
    console.warn("Google Maps API Key is missing. Using mock routes generator.");
    return generateMockRoutes(start, end);
  }

  try {
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const body = {
      origin: { location: { latLng: { latitude: start.latitude, longitude: start.longitude } } },
      destination: { location: { latLng: { latitude: end.latitude, longitude: end.longitude } } },
      travelMode: travelMode,
      computeAlternativeRoutes: true
    };
    
    const response = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
      }
    });

    if (!response.data.routes || !response.data.routes.length) {
      throw new Error("No routes found from Google Routes API.");
    }

    return response.data.routes;
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn("Google Routes API Quota Exceeded (429). Falling back to mock routes.");
      return generateMockRoutes(start, end);
    }
    console.error("Google Routes API Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches nearby places of specific types from Google Places API.
 */
export const getNearbyPlacesFromGoogle = async (latitude, longitude, category, radius = 2000) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  // Category map to Google Places types
  const categoryTypeMap = {
    "Police Station": "police",
    "Hospital": "hospital",
    "Petrol Pump": "gas_station",
    "Hotel": "lodging",
    "Metro Station": "subway_station",
    "Railway Station": "train_station",
    "Bus Terminal": "bus_station"
  };

  const placeType = categoryTypeMap[category] || "point_of_interest";

  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
    console.warn("Google Maps API Key is missing. Using mock safe points.");
    // Mock response of nearby places
    return [
      {
        name: `Mock Google ${category}`,
        geometry: {
          location: {
            lat: latitude + 0.002,
            lng: longitude + 0.002
          }
        },
        place_id: `mock_place_${category.toLowerCase().replace(" ", "_")}_1`,
        business_status: "OPERATIONAL"
      }
    ];
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${placeType}&key=${apiKey}`;
    const response = await axios.get(url);
    
    if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error status: ${response.data.status}`);
    }

    const results = response.data.results || [];
    return results.map(place => ({
      name: place.name,
      geometry: place.geometry,
      place_id: place.place_id,
      business_status: place.business_status
    }));
  } catch (error) {
    console.error("Google Places Error:", error.message);
    return [];
  }
};
