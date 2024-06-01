import express from "express";
import { createChapitre,getChapitre,getChapitreAndActivite,deleteChapitre,updateChapitre } from "../controllers/chapitre.js";


const router = express.Router();

router.post("/createChapitre", createChapitre);
router.get("/getChapitre/:id", getChapitre);
router.get("/getChapitreAndActivite/:id", getChapitreAndActivite);
router.delete("/deleteChapitre/:id", deleteChapitre);
router.put("/updateChapitre/:id", updateChapitre);



export default router;