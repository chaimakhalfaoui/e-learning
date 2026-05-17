// routes/categorie.js
import express from "express";
import { 
  getAllCategorie, 
  getCategorieById,
  createCategorie, 
  updateCategorie, 
  deleteCategorie 
} from "../controllers/categorie.js";

const router = express.Router();

router.get("/", getAllCategorie);
router.get("/:id", getCategorieById);
router.post("/", updateCategorie);  // Utilise updateCategorie car il gère l'upload
router.put("/:id", updateCategorie);
router.delete("/:id", deleteCategorie);

export default router;