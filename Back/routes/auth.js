import express from "express";
import { register, login, logout,checkUserRole,checkUserRoleA,deleteUser,countUsers,getLatestTeachers ,getUserById,getAdminById,updateprofil,updateAdminById,getStatistics,getAllTeachers,getAllStudents
    , verifyCode, resendCode, getMonthlyInscriptions, getCoursParCategorie
} from "../controllers/auth.js";


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
// Ajoutez ces routes

router.delete("/deleteUser/:id",deleteUser );


router.get("/getStatistics", getStatistics);
router.get("/monthlyInscriptions", getMonthlyInscriptions);
router.get("/coursParCategorie", getCoursParCategorie);
router.get("/getAllTeachers", getAllTeachers);
router.get("/getAllStudents", getAllStudents);
// Nouvelles routes pour la vérification par email
router.post("/verify-code", verifyCode);
router.post("/resend-code", resendCode);



export default router;