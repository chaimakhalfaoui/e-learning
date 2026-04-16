import express from "express";
import { getAllUsers, getUserById, addUser, updateUser, deleteUser } from "../controllers/users.js";

const router = express.Router();

router.get("/", getAllUsers);        // GET tous les utilisateurs
router.get("/:id", getUserById);     // GET un utilisateur par ID
router.post("/", addUser);           // POST ajouter un utilisateur
router.put("/:id", updateUser);      // PUT mettre à jour un utilisateur
router.delete("/:id", deleteUser);   // DELETE supprimer un utilisateur

export default router;

