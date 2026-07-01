/**
 * Mock static datasets and generators for SheShield MVP.
 */

// Generate random coordinates around a base location within a max offset
const getRandomOffset = (maxOffset = 0.05) => (Math.random() - 0.5) * maxOffset;

/**
 * Generate Mock Heatmap Data around a location.
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Array} [lat, lng, intensity]
 */
export const generateMockHeatmapData = (lat, lng) => {
  const points = [];
  const numClusters = 5;
  const pointsPerCluster = 10;

  for (let i = 0; i < numClusters; i++) {
    const clusterLat = lat + getRandomOffset(0.08);
    const clusterLng = lng + getRandomOffset(0.08);
    const baseIntensity = 0.3 + Math.random() * 0.7; // 0.3 to 1.0

    for (let j = 0; j < pointsPerCluster; j++) {
      points.push([
        clusterLat + getRandomOffset(0.015),
        clusterLng + getRandomOffset(0.015),
        baseIntensity * (0.8 + Math.random() * 0.2) // slight variation
      ]);
    }
  }

  return points;
};

/**
 * Generate Mock Safe Points around a location.
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Array} List of safe points
 */
export const generateMockSafePoints = (lat, lng) => {
  const points = [];
  
  const types = [
    { type: 'police', name: 'Police Station', isOpen24h: true, phone: '100' },
    { type: 'hospital', name: 'City Hospital', isOpen24h: true, phone: '102' },
    { type: 'metro', name: 'Metro Station', isOpen24h: false, phone: null },
    { type: 'pharmacy', name: '24/7 Pharmacy', isOpen24h: true, phone: '104' },
    { type: 'womens_desk', name: "Women's Help Desk", isOpen24h: true, phone: '1091' },
  ];

  // Generate a few of each type
  let idCounter = 1;
  types.forEach(t => {
    const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 of each
    for (let i = 0; i < count; i++) {
      const pLat = lat + getRandomOffset(0.06);
      const pLng = lng + getRandomOffset(0.06);
      
      // Calculate rough distance in meters
      const dLat = (pLat - lat) * 111320;
      const dLng = (pLng - lng) * 400000 * Math.cos(lat * Math.PI / 180) / 360;
      const distance = Math.floor(Math.sqrt(dLat * dLat + dLng * dLng));

      points.push({
        id: `sp_${t.type}_00${idCounter++}`,
        type: t.type,
        name: `${t.name} ${i + 1}`,
        address: `Sector ${Math.floor(Math.random() * 50) + 1}, Nearby`,
        lat: pLat,
        lng: pLng,
        distance,
        isOpen24h: t.isOpen24h,
        phone: t.phone,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
      });
    }
  });

  return points.sort((a, b) => a.distance - b.distance);
};

/* ── Mock Search Suggestions (Still static for fallback) ── */
export const MOCK_SEARCH_RESULTS = [
  { id: 's1', name: 'Connaught Place',       subtitle: 'New Delhi, Delhi',          lat: 28.6315, lng: 77.2167, type: 'area'     },
  { id: 's2', name: 'India Gate',            subtitle: 'Rajpath, New Delhi',        lat: 28.6129, lng: 77.2295, type: 'landmark'  },
  { id: 's3', name: 'Karol Bagh',            subtitle: 'New Delhi, Delhi',          lat: 28.6519, lng: 77.1909, type: 'area'     },
  { id: 's4', name: 'Lodi Garden',           subtitle: 'Lodi Road, New Delhi',      lat: 28.5931, lng: 77.2196, type: 'landmark'  },
  { id: 's5', name: 'Khan Market',           subtitle: 'New Delhi, Delhi',          lat: 28.5998, lng: 77.2260, type: 'area'     },
  { id: 's6', name: 'Sarojini Nagar Market', subtitle: 'South Delhi, Delhi',        lat: 28.5756, lng: 77.1927, type: 'area'     },
  { id: 's7', name: 'Hazrat Nizamuddin',     subtitle: 'Nizamuddin, New Delhi',     lat: 28.5920, lng: 77.2480, type: 'transit'   },
  { id: 's8', name: 'New Delhi Railway',     subtitle: 'Paharganj, New Delhi',      lat: 28.6431, lng: 77.2192, type: 'transit'   },
];
