import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Station from '../models/Station.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/railwise';

const importData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected...');

    // Read the JSON file
    const stationsPath = path.join(__dirname, 'list_of_stations.json');
    console.log(`Reading stations from ${stationsPath}...`);
    const stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf-8'));

    // Transform data to match our schema
    console.log(`Found ${stationsData.length} stations. Transforming data...`);
    const formattedStations = stationsData.map(station => ({
      stationCode: station.station_code,
      stationName: station.station_name,
      regionCode: station.region_code
    }));

    // Clear existing stations
    console.log('Clearing existing stations from DB...');
    await Station.deleteMany();

    // Insert new stations
    console.log('Inserting stations into DB... (This may take a moment)');
    await Station.insertMany(formattedStations);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
