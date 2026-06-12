import express from 'express';
import { searchStations } from '../controllers/stationController.js';

const router = express.Router();

// GET /api/stations/search?q=Delhi
router.get('/search', searchStations);

export default router;
