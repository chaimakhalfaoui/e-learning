import express from "express";
import { getAllLevel } from "../controllers/level.js";


const router = express.Router();

router.get('/getAllLevel', getAllLevel);



export default router;