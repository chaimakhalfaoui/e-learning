import express from "express";
import { register, login, logout,checkUserRole,checkUserRoleA,deleteUser,countUsers,getLatestTeachers ,getUserById,getAdminById,updateprofil,updateAdminById,getStatistics,getAllTeachers,getAllStudents} from "../controllers/auth.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/checkUserRole/:id", checkUserRole);
router.get("/checkUserRoleA/:id", checkUserRoleA);
router.get("/getUserById/:id", getUserById);
router.get("/getAdminById/:id", getAdminById);
router.get("/countUsers", countUsers);
router.get("/latestTeachers", getLatestTeachers);
router.put("/updateprofil/:id", updateprofil);
router.put("/updateAdminById/:id", updateAdminById);
router.get("/getStatistics", getStatistics);
router.get("/getAllTeachers", getAllTeachers);
router.get("/getAllStudents", getAllStudents);
router.delete("/deleteUser/:id",deleteUser );



export default router;