import { getImageByName } from "../controllers/image.js";
import express from 'express';

// Créer une instance du routeur express
const router = express.Router();

router.get('/:name', getImageByName);

// Exporter le routeur
export default router;