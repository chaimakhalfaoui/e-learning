// routes/ressource.js
import express from 'express';
import {
    getRessourcesByChapitre,
    getRessourceById,
    createRessource,
    createRessourceVideo,
    updateRessource,
    deleteRessource,
    downloadFichier,
    getVideo,
    getFichierUrl,
    getRessourcesStats
} from '../controllers/ressource.js';

const router = express.Router();

router.get("/getAllRessourceId/:id_chapitre", getRessourcesByChapitre);
router.get("/getRessourceById/:id", getRessourceById);
router.post("/createRessource", createRessource);
router.post("/createRessourceVideo", createRessourceVideo);
router.put("/updateRessource/:id", updateRessource);
router.delete("/deleteRessource/:id", deleteRessource);
router.get("/download/:filename", downloadFichier);
router.get("/video/:filename", getVideo);
router.get("/fichier/:filename", getFichierUrl);
router.get("/stats/:id_chapitre", getRessourcesStats);

export default router;