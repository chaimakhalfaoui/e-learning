import express from "express";
import { getAllLevel } from "../controllers/level.js";


const router = express.Router();

router.get('/', getAllLevel);



export default router;