import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Incident from "../models/Incident.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

// Kesrisinghpur, Sri Ganganagar base coordinates
const BASE_LAT = 29.9475;
const BASE_LNG = 73.6212;
const RADIUS = 0.05; // roughly 5km variance for a smaller town

const INCIDENT_TYPES = [
  "Harassment",
  "Suspicious Activity",
  "Poor Lighting",
  "Road Block",
  "Unsafe Crowd",
  "Police Patrol",
  "Accident"
];

const DESCRIPTIONS = [
  "Felt unsafe walking down this street at night.",
  "There is a group of suspicious people loitering here.",
  "Streetlights are completely off on this stretch.",
  "Major road block, avoid this route.",
  "Crowd getting rowdy, not a safe place right now.",
  "Police patrol spotted here, area seems secure.",
  "Minor accident caused a traffic jam."
];

const getRandomDateInPast30Days = () => {
  const now = new Date();
  const past30Days = now.getTime() - (30 * 24 * 60 * 60 * 1000);
  return new Date(past30Days + Math.random() * (now.getTime() - past30Days));
};

const generateIncidents = (reporterId, count = 100) => {
  const incidents = [];
  
  for (let i = 0; i < count; i++) {
    const lat = BASE_LAT + (Math.random() - 0.5) * RADIUS;
    const lng = BASE_LNG + (Math.random() - 0.5) * RADIUS;
    const type = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
    const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
    const createdAt = getRandomDateInPast30Days();
    
    incidents.push({
      _id: new mongoose.Types.ObjectId(),
      type,
      description,
      latitude: lat,
      longitude: lng,
      location: {
        type: "Point",
        coordinates: [lng, lat] // note: [longitude, latitude]
      },
      image: "",
      verificationCount: Math.floor(Math.random() * 5),
      verifiedBy: [],
      reporter: reporterId,
      createdAt: createdAt,
      updatedAt: createdAt
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

    let user = await User.findOne({ email: "test_reporter@sheshield.com" });
    if (!user) {
      console.log("Creating dummy user for reporter...");
      const hashedPassword = await bcrypt.hash("password123", 10);
      const randomPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      user = new User({
        name: "Test Reporter",
        email: "test_reporter@sheshield.com",
        password: hashedPassword,
        phone: randomPhone,
        role: "user"
      });
      await user.save();
    }
    
    console.log("Generating mock incidents...");
    const mockIncidents = generateIncidents(user._id, 200);

    console.log(`Inserting ${mockIncidents.length} incidents...`);
    // Using collection.insertMany to preserve custom createdAt/updatedAt dates
    await Incident.collection.insertMany(mockIncidents);
    
    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding incidents:", error);
    process.exit(1);
  }
};

seedDatabase();
