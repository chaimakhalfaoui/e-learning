import express from "express";
import {
    getAllUsers,
    getUserById,
    getUsersByRole,
    addUser,
    updateUser,
    updateUserSimple,
    updateUserRole,
    deleteUser
} from "../controllers/users.js";

const router = express.Router();

// GET /api/users - Récupérer tous les utilisateurs
router.get("/", getAllUsers);

// GET /api/users/all - Récupérer tous les utilisateurs (alias)
router.get("/all", getAllUsers);

// GET /api/users/role/:role - Récupérer les utilisateurs par rôle
router.get("/role/:role", getUsersByRole);

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get("/:id", getUserById);

// POST /api/users/add - Ajouter un utilisateur
router.post("/add", addUser);

// POST /api/users - Ajouter un utilisateur (alias)
router.post("/", addUser);

// PUT /api/users/update/:id - Mettre à jour un utilisateur
router.put("/update/:id", updateUser);

// PUT /api/users/update-simple/:id - Mettre à jour (version simplifiée)
router.put("/update-simple/:id", updateUserSimple);

// PUT /api/users/role/:id - Mettre à jour uniquement le rôle
router.put("/role/:id", updateUserRole);

// DELETE /api/users/delete/:id - Supprimer un utilisateur
router.delete("/delete/:id", deleteUser);

// DELETE /api/users/:id - Supprimer un utilisateur (alias)
router.delete("/:id", deleteUser);

export default router;
