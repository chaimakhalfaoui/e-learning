// routes/cours.js
import express from "express";
import { 
    createCours,
    getAllCourses,
    getAllCoursesId,
    getCourse,
    getUserNameByCourseId,
    getUserIdByCourseId,
    deleteCourse,
    updateCours,
    getCoursByCategorie,
    updateCourseStatus,
    getCoursesByStatus,
    getStudentEnrolledCourses,
    getEtudiantsByCours,
    getCoursesWithValidationStatus,
    getPendingCourses,
    rejectCourse,
    approveCourse,
    requestValidation
} from "../controllers/cours.js";

const router = express.Router();

// ==================== CRUD ====================
router.post("/createCours", createCours);
router.get("/", getAllCourses);
router.get("/getAllCoursesId/:id", getAllCoursesId);
router.get("/getCourse/:id", getCourse);
router.put("/updateCours/:id", updateCours);
router.delete("/deleteCourse/:id", deleteCourse);

// ==================== UTILITAIRES ====================
router.get("/getUserNameByCourseId/:id", getUserNameByCourseId);
router.get("/getUserIdByCourseId/:id", getUserIdByCourseId);

// ==================== FILTRES ====================
router.get("/categorie/:idCategorie/cours", getCoursByCategorie);
router.get("/by-status/:status", getCoursesByStatus);
router.put("/status/:id", updateCourseStatus);

// ==================== ÉTUDIANTS ====================
router.get("/student-courses/:idUser", getStudentEnrolledCourses);
router.get("/getEtudiantsByCours/:coursId", getEtudiantsByCours);  // Route corrigée

// ==================== VALIDATION ====================
router.put("/request-validation/:id", requestValidation);
router.put("/approve/:id", approveCourse);
router.put("/reject/:id", rejectCourse);
router.get("/pending-courses", getPendingCourses);
router.get("/my-courses-validation/:idUser", getCoursesWithValidationStatus);

export default router;