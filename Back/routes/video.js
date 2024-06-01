import { getVideoByName } from "../controllers/video.js";
import express from 'express';

// Créer une instance du routeur express
const router = express.Router();

router.get('/:name', getVideoByName);

// Exporter le routeur
export default router;