// routes/ressource.js
import express from "express";
import {
    getRessourcesByChapitre,
    getRessourceById,
    createRessource,
    updateRessource,
    deleteRessource,
    downloadFichier,
    getFichierUrl,
    getRessourcesStats
} from "../controllers/ressource.js";

const router = express.Router();

// Routes CRUD
router.get("/getAllRessourceId/:id_chapitre", getRessourcesByChapitre);
router.get("/getRessourceById/:id", getRessourceById);
router.post("/createRessource", createRessource);
router.put("/updateRessource/:id", updateRessource);
router.delete("/deleteRessource/:id", deleteRessource);

// Routes pour les fichiers
router.get("/fichier/:filename", getFichierUrl);
router.get("/download/:filename", downloadFichier);

// Routes statistiques
router.get("/stats/:id_chapitre", getRessourcesStats);

export default router;