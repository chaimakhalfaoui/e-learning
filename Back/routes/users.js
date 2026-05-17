import express from "express";
import {
<<<<<<< HEAD
    getAllUsers,
    getUserById,
    getUsersByRole,
    addUser,
    updateUser,
    updateUserSimple,
    updateUserRole,
    deleteUser
=======
  getAllUsers,
  getUserById,
  getUsersByRole,
  addUser,
  updateUser,
  updateUserSimple,
  updateUserRole,
  deleteUser
>>>>>>> 08659bf02d98d91ae50074d86f666aa0ce63aeb7
} from "../controllers/users.js";

const router = express.Router();

<<<<<<< HEAD
// ==================== ROUTES PUBLIQUES ====================
// GET /api/users - Récupérer tous les utilisateurs
router.get("/", getAllUsers);

// GET /api/users/all - Récupérer tous les utilisateurs (alias)
router.get("/all", getAllUsers);

// GET /api/users/role/:role - Récupérer les utilisateurs par rôle
router.get("/role/:role", getUsersByRole);

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get("/:id", getUserById);

// ==================== ROUTES D'AJOUT ====================
// POST /api/users/add - Ajouter un utilisateur
router.post("/add", addUser);

// POST /api/users - Ajouter un utilisateur (alias)
router.post("/", addUser);

// ==================== ROUTES DE MISE À JOUR ====================
// PUT /api/users/update/:id - Mettre à jour un utilisateur
router.put("/update/:id", updateUser);

// PUT /api/users/update-simple/:id - Mettre à jour (version simplifiée)
router.put("/update-simple/:id", updateUserSimple);

// PUT /api/users/role/:id - Mettre à jour uniquement le rôle
router.put("/role/:id", updateUserRole);

// ==================== ROUTES DE SUPPRESSION ====================
// DELETE /api/users/delete/:id - Supprimer un utilisateur
router.delete("/delete/:id", deleteUser);

// DELETE /api/users/:id - Supprimer un utilisateur (alias)
router.delete("/:id", deleteUser);
=======
// ✅ Routes publiques
router.get("/", getAllUsers);
router.get("/all", getAllUsers);
router.get("/role/:role", getUsersByRole);
router.get("/:id", getUserById);

// ✅ Routes d'administration
router.post("/add", addUser);
router.post("/", addUser);
>>>>>>> 08659bf02d98d91ae50074d86f666aa0ce63aeb7

// ✅ Routes de mise à jour
router.put("/update/:id", updateUser);
router.put("/update-simple/:id", updateUserSimple);
router.put("/role/:id", updateUserRole);

// ✅ Route de suppression
router.delete("/delete/:id", deleteUser);
router.delete("/:id", deleteUser);

export default router;
