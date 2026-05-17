// routes/activite.js
import express from "express";
import {
  getActivite,
  getActivitesByChapitre,
  createActivite,
  createActivitei,
  createActivitev,
  createQuestionnaire,
  createDevoir,
  createVideoInteractive,
  getDevoirFichier,
  getAllActiviteId,
  deleteActivite,
  updateActiviteText,
  updateActiviteI,
  updateActiviteVideo
} from "../controllers/activit.js";

const router = express.Router();

// Routes existantes
router.post("/createActivite", createActivite);
router.post("/createActivitei", createActivitei);
router.post("/createActivitev", createActivitev);
router.get("/getAllActiviteId/:id", getAllActiviteId);
router.delete("/deleteActivite/:id", deleteActivite);
router.put("/updateActiviteText/:id", updateActiviteText);
router.put("/updateActiviteI/:id", updateActiviteI);
router.put("/updateActiviteVideo/:id", updateActiviteVideo);
router.get("/getActivite/:id", getActivite);
router.get("/getByChapitre/:chapitreId", getActivitesByChapitre);

// Nouvelles routes
router.post("/createQuestionnaire", createQuestionnaire);
router.post("/createDevoir", createDevoir);
router.post("/createVideoInteractive", createVideoInteractive);
router.get("/fichier/:filename", getDevoirFichier);

export default router;