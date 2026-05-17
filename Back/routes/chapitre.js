// routes/chapitre.js
import express from "express";
import {
    createChapitre,
    getChapitre,
    getChapitresByCours,
    getChapitreAndActivite,
    deleteChapitre,
    updateChapitre
} from "../controllers/chapitre.js";

const router = express.Router();

router.post("/createChapitre", createChapitre);
router.get("/getChapitre/:id", getChapitre);           // Récupère par id_chapitre ou id_cours
router.get("/getChapitresByCours/:id", getChapitresByCours);  // Récupère tous les chapitres d'un cours
router.get("/getChapitreAndActivite/:id", getChapitreAndActivite);
router.delete("/deleteChapitre/:id", deleteChapitre);
router.put("/updateChapitre/:id", updateChapitre);

export default router;