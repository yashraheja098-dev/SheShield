import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import HistoricalIncident from "../models/HistoricalIncident.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI = process.env.Mongo_URI || process.env.MONGO_URI;

// Kesrisinghpur, Sri Ganganagar base coordinates
const BASE_LAT = 29.9475;
const BASE_LNG = 73.6212;
const RADIUS = 0.05; // roughly 5km variance for a smaller town

const CATEGORIES = [
  "Theft",
  "Assault",
  "Harassment",
  "Vandalism",
  "Robbery"
];

const SEVERITIES = ["Low", "Medium", "High"];

const generateHistoricalIncidents = (count = 100) => {
  const incidents = [];
  
  for (let i = 0; i < count; i++) {
    const lat = BASE_LAT + (Math.random() - 0.5) * RADIUS;
    const lng = BASE_LNG + (Math.random() - 0.5) * RADIUS;
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const year = new Date().getFullYear();
    
    incidents.push({
      _id: new mongoose.Types.ObjectId(),
      category,
      severity,
      year,
      source: "Official Crime Records",
      latitude: lat,
      longitude: lng,
      location: {
        type: "Point",
        coordinates: [lng, lat]
      }
    });
  }
  return incidents;
};

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");



    console.log("Generating mock historical incidents...");
    const mockIncidents = generateHistoricalIncidents(200); // 200 incidents for heatmap

    console.log(`Inserting ${mockIncidents.length} historical incidents...`);
    await HistoricalIncident.collection.insertMany(mockIncidents);
    
    console.log("Historical Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding historical incidents:", error);
    process.exit(1);
  }
};

seedDatabase();
