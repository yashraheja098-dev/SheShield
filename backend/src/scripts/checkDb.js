import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Incident from "../models/Incident.js";
import HistoricalIncident from "../models/HistoricalIncident.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI = process.env.Mongo_URI || process.env.MONGO_URI;

const checkDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const incCount = await Incident.countDocuments();
    const histCount = await HistoricalIncident.countDocuments();
    console.log(`Incidents count: ${incCount}`);
    console.log(`Historical Incidents count: ${histCount}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
checkDb();
