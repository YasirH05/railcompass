import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  stationCode: {
    type: String,
    required: true,
    unique: true,
    index: true, // For fast exact code lookups
  },
  stationName: {
    type: String,
    required: true,
    index: true, // For fast autocomplete searches
  },
  regionCode: {
    type: String,
  }
}, { timestamps: true });

const Station = mongoose.model('Station', stationSchema);

export default Station;
