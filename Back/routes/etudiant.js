import express from "express";
import { 
  getAllEtudiants, 
  addEtudiant, 
  getEtudiantById,
  updateEtudiant, 
  deleteEtudiant 
} from "../controllers/etudiant.js";

const router = express.Router();

// ✅ Routes Étudiants
router.get("/", getAllEtudiants);       // GET tous les étudiants
router.get("/:id", getEtudiantById);   
router.post("/", addEtudiant);          // POST ajouter un étudiant
router.put("/:id", updateEtudiant);     // PUT mettre à jour un étudiant
router.delete("/:id", deleteEtudiant);  // DELETE supprimer un étudiant

export default router;
