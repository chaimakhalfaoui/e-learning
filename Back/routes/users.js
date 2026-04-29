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

// ✅ Routes publiques
router.get("/", getAllUsers);
router.get("/all", getAllUsers);
router.get("/role/:role", getUsersByRole);
router.get("/:id", getUserById);

// ✅ Routes d'administration
router.post("/add", addUser);
router.post("/", addUser);

// ✅ Routes de mise à jour
router.put("/update/:id", updateUser);
router.put("/update-simple/:id", updateUserSimple);
router.put("/role/:id", updateUserRole);

// ✅ Route de suppression
router.delete("/delete/:id", deleteUser);
router.delete("/:id", deleteUser);

export default router;
