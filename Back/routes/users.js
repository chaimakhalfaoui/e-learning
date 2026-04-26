// routes/coordinateurs.js
import express from "express";
import {
    getAllCoordinateurs,
    getCoordinateurById,
    addCoordinateur,
    updateCoordinateur,
    deleteCoordinateur
} from "../controllers/coordinateur.js";
import { updateUserRole } from "../controllers/users.js"; // 👈 Import de la fonction

const router = express.Router();

router.get("/", getAllCoordinateurs);
router.get("/:id", getCoordinateurById);
router.post("/", addCoordinateur);
router.put("/:id", updateCoordinateur);
router.delete("/:id", deleteCoordinateur);

// 👈 Ajouter cette route pour mettre à jour le rôle d'un coordinateur
router.put("/:id/role", updateUserRole);

export default router;