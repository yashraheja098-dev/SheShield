import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup env to connect to Atlas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import SafePoint from '../models/SafePoint.js';

const seedSafePoints = async () => {
  try {
    const mongoUri = process.env.Mongo_URI || "mongodb://localhost:27017/sheshield";
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Clear existing to avoid duplicates if run multiple times
    await SafePoint.deleteMany({});
    console.log('Cleared existing SafePoints.');

    const demoPoints = [
      {
        name: 'Kesrisinghpur City Police Station',
        latitude: 29.9480,
        longitude: 73.6220,
        category: 'Police Station',
        openStatus: 'Open 24/7',
        location: { type: "Point", coordinates: [73.6220, 29.9480] }
      },
      {
        name: 'Government Hospital Kesrisinghpur',
        latitude: 29.9450,
        longitude: 73.6200,
        category: 'Hospital',
        openStatus: 'Open 24/7',
        location: { type: "Point", coordinates: [73.6200, 29.9450] }
      },
      {
        name: 'Kesrisinghpur Railway Station',
        latitude: 29.9500,
        longitude: 73.6250,
        category: 'Railway Station',
        openStatus: 'Open 24/7',
        location: { type: "Point", coordinates: [73.6250, 29.9500] }
      },
      {
        name: 'Local Pharmacy 24/7',
        latitude: 29.9470,
        longitude: 73.6230,
        category: 'Pharmacy',
        openStatus: 'Open 24/7',
        location: { type: "Point", coordinates: [73.6230, 29.9470] }
      },
      {
        name: 'Women Help Centre',
        latitude: 29.9460,
        longitude: 73.6210,
        category: 'Women Help Centre',
        openStatus: 'Open 24/7',
        location: { type: "Point", coordinates: [73.6210, 29.9460] }
      },
      {
        name: 'Indian Oil Petrol Pump',
        latitude: 29.9420,
        longitude: 73.6180,
        category: 'Petrol Pump',
        openStatus: 'Open 24/7',
        location: { type: "Point", coordinates: [73.6180, 29.9420] }
      },
      {
        name: 'Highway Hotel & Rest',
        latitude: 29.9400,
        longitude: 73.6150,
        category: 'Hotel',
        openStatus: 'Open 24/7',
        location: { type: "Point", coordinates: [73.6150, 29.9400] }
      }
    ];

    await SafePoint.insertMany(demoPoints);
    console.log(`Successfully seeded ${demoPoints.length} safe points!`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
};

seedSafePoints();
