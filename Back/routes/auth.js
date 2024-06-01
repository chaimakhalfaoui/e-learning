import express from "express";
import { register, login, logout,checkUserRole,checkUserRoleA,countUsers,getLatestTeachers ,getUserById,getAdminById,updateprofil,updateAdminById,getStatistics} from "../controllers/auth.js";


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



export default router;