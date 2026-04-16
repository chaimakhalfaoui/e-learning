import express from "express";
import { 
  getAllCategorie, 
  createCategorie, 
  updateCategorie, 
  deleteCategorie, 
  upload 
} from "../controllers/categorie.js";

const router = express.Router();

// Récupérer toutes les catégories
router.get("/", getAllCategorie);

// Créer une nouvelle catégorie avec upload image
router.post("/", upload.single("image"), createCategorie);

// Mettre à jour une catégorie
router.put("/:id", upload.single("image"), updateCategorie);

// Supprimer une catégorie
router.delete("/:id", deleteCategorie);

export default router;
