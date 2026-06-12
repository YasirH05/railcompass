import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filterStations = () => {
  const inputPath = path.join(__dirname, 'list_of_stations.json');
  const outputPath = path.join(__dirname, 'cleaned_stations.json');

  console.log(`Reading original dataset from: ${inputPath}`);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  const initialCount = data.length;

  const EXCLUSION_KEYWORDS = [
    'GOODS', 'SDG', 'CABIN', 'YARD', 'COLLIERY', 'PORT', 
    'DEPOT', 'SIDING', 'CHORD', 'WORKSHOP', 'FACTORY', 
    'HALT', 'BLOCK', 'O.A.', 'G.S.', 'C.A.', 'C B'
  ];

  // Note: we purposefully do NOT exclude "CANTT" as many cantt stations are major passenger hubs (e.g. Delhi Cantt, Agra Cantt)

  const filteredData = data.filter(station => {
    const name = station.station_name.toUpperCase();
    
    // Check if name contains any exclusion keyword
    for (let keyword of EXCLUSION_KEYWORDS) {
      // Use regex to match whole words or parts to be safe, but simple includes is fast.
      // E.g. " SDG" to ensure we don't accidentally match part of a normal word
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(name)) {
        return false;
      }
    }
    return true;
  });

  const finalCount = filteredData.length;
  
  fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2), 'utf8');
  
  console.log(`✅ Filter complete!`);
  console.log(`Original Station Count: ${initialCount}`);
  console.log(`Filtered Station Count: ${finalCount}`);
  console.log(`Removed ${initialCount - finalCount} unnecessary stations.`);
};

filterStations();
