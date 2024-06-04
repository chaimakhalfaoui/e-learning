import express from "express";
import { getAllCategorie } from "../controllers/categorie.js";


const router = express.Router();

router.get('/getAllCategorie', getAllCategorie);



export default router;