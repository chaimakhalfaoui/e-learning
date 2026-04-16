import express from "express";
import { getAllEnseignants, addEnseignant, updateEnseignant, deleteEnseignant, getEnseignantById  } from "../controllers/enseignant.js";

const router = express.Router();

// ✅ Routes Enseignants
router.get("/", getAllEnseignants);       // GET tous les enseignants
router.get("/:id", getEnseignantById); 
router.post("/", addEnseignant);          // POST ajouter un enseignant
router.put("/:id", updateEnseignant);     // PUT mettre à jour un enseignant
router.delete("/:id", deleteEnseignant);  // DELETE supprimer un enseignant

export default router;
