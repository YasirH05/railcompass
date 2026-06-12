import Station from '../models/Station.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory fallback
let stationsCache = null;

const loadStationsFromFile = () => {
  if (stationsCache) return stationsCache;
  try {
    const stationsPath = path.join(__dirname, '../seed/cleaned_stations.json');
    const data = fs.readFileSync(stationsPath, 'utf8');
    const parsed = JSON.parse(data);
    stationsCache = parsed.map(s => ({
      stationCode: s.station_code,
      stationName: s.station_name
    }));
    return stationsCache;
  } catch (error) {
    console.error('Error loading stations from file fallback:', error.message);
    return [];
  }
};

export const searchStations = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const searchQuery = q.toLowerCase();
    let stations = [];

    // Try MongoDB first if connected (readyState === 1)
    if (mongoose.connection.readyState === 1) {
      try {
        stations = await Station.find({
          $or: [
            { stationName: { $regex: searchQuery, $options: 'i' } },
            { stationCode: { $regex: searchQuery, $options: 'i' } }
          ]
        }).limit(20);
      } catch (dbError) {
        // Database might be disconnected or empty, use fallback
      }
    }

    if (stations.length === 0) {
      // Use in-memory fallback
      const allStations = loadStationsFromFile();
      stations = allStations.filter(s => 
        s.stationName.toLowerCase().includes(searchQuery) || 
        s.stationCode.toLowerCase().includes(searchQuery)
      ).slice(0, 20); // Limit to 20 for fast response
    }

    res.json(stations);
  } catch (error) {
    console.error('Error in searchStations:', error);
    res.status(500).json({ message: 'Server error searching stations' });
  }
};
