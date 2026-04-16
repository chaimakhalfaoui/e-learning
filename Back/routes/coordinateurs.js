import express from "express";
import { getAllCoordinateurs,getCoordinateurById, addCoordinateur, updateCoordinateur, deleteCoordinateur } from "../controllers/coordinateur.js";

const router = express.Router();

router.get("/", getAllCoordinateurs);
router.post("/", addCoordinateur);
router.get("/:id", getCoordinateurById); 
router.put("/:id", updateCoordinateur);
router.delete("/:id", deleteCoordinateur);

export default router;
