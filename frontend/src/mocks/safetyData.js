/**
 * Mock static datasets for SheShield MVP.
 * Seeded around New Delhi, India.
 *
 * Format notes:
 *   heatmap:    [lat, lng, intensity]  intensity ∈ [0, 1]
 *   safePoints: typed place objects matching the planned API response shape
 */

/* ── Mock Heat Map Intensity Data ──
   Night-weighted incident density around central Delhi.
   High values = high risk areas.
*/
export const MOCK_HEATMAP_DATA = [
  // Paharganj area - higher risk at night
  [28.6441, 77.2138, 0.90],
  [28.6428, 77.2100, 0.85],
  [28.6450, 77.2200, 0.80],
  // Sadar Bazaar
  [28.6568, 77.2047, 0.75],
  [28.6550, 77.2060, 0.70],
  // Near Nizamuddin
  [28.5920, 77.2480, 0.65],
  [28.5880, 77.2500, 0.60],
  // Lower risk - Connaught Place area
  [28.6315, 77.2167, 0.30],
  [28.6280, 77.2120, 0.25],
  [28.6340, 77.2200, 0.20],
  // India Gate area - safer
  [28.6129, 77.2295, 0.15],
  [28.6100, 77.2280, 0.10],
  // Karol Bagh - mixed
  [28.6519, 77.1909, 0.55],
  [28.6500, 77.1880, 0.50],
  [28.6540, 77.1930, 0.45],
];

/* ── Mock Safe Points ──
   Typed exactly as the planned real API will return.
*/
export const MOCK_SAFE_POINTS = [
  {
    id:         'sp_police_001',
    type:       'police',
    name:       'Connaught Place Police Station',
    address:    'Connaught Place, New Delhi - 110001',
    lat:        28.6315,
    lng:        77.2167,
    distance:   450,
    isOpen24h:  true,
    phone:      '100',
    rating:     4.1,
  },
  {
    id:         'sp_hospital_001',
    type:       'hospital',
    name:       'Ram Manohar Lohia Hospital',
    address:    'Baba Kharak Singh Marg, New Delhi',
    lat:        28.6271,
    lng:        77.2022,
    distance:   820,
    isOpen24h:  true,
    phone:      '011-23365525',
    rating:     4.3,
  },
  {
    id:         'sp_metro_001',
    type:       'metro',
    name:       'Rajiv Chowk Metro Station',
    address:    'Connaught Place, New Delhi',
    lat:        28.6328,
    lng:        77.2197,
    distance:   380,
    isOpen24h:  false,
    phone:      null,
    rating:     4.6,
  },
  {
    id:         'sp_pharmacy_001',
    type:       'pharmacy',
    name:       'Apollo Pharmacy 24/7',
    address:    'Janpath, New Delhi',
    lat:        28.6250,
    lng:        77.2180,
    distance:   290,
    isOpen24h:  true,
    phone:      '1860-500-0101',
    rating:     4.4,
  },
  {
    id:         'sp_womens_001',
    type:       'womens_desk',
    name:       "Women's Help Desk — CP",
    address:    'Connaught Place Police Station, New Delhi',
    lat:        28.6320,
    lng:        77.2170,
    distance:   460,
    isOpen24h:  true,
    phone:      '1091',
    rating:     4.5,
  },
  {
    id:         'sp_petrol_001',
    type:       'petrol_pump',
    name:       'HP Petrol Pump',
    address:    'Sansad Marg, New Delhi',
    lat:        28.6248,
    lng:        77.2095,
    distance:   620,
    isOpen24h:  true,
    phone:      null,
    rating:     3.9,
  },
  {
    id:         'sp_hotel_001',
    type:       'hotel',
    name:       'The Metropolitan Hotel',
    address:    'Bangla Sahib Marg, New Delhi',
    lat:        28.6340,
    lng:        77.2105,
    distance:   750,
    isOpen24h:  true,
    phone:      '011-23410101',
    rating:     4.7,
  },
];

/* ── Mock Search Suggestions ── */
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
