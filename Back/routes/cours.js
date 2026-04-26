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
    getEtudiantsByCours,        // Une seule déclaration
    getCoursesWithValidationStatus,
    getPendingCourses,
    rejectCourse,
    approveCourse,
    requestValidation
} from "../controllers/cours.js";

const router = express.Router();

// ==================== CRUD ====================
// POST /api/cours/createCours - Créer un cours (enseignant)
router.post("/createCours", createCours);

// GET /api/cours - Récupérer tous les cours
router.get("/", getAllCourses);

// GET /api/cours/getAllCoursesId/:id - Récupérer les cours d'un enseignant
router.get("/getAllCoursesId/:id", getAllCoursesId);

// GET /api/cours/getCourse/:id - Récupérer un cours par ID
router.get("/getCourse/:id", getCourse);

// PUT /api/cours/updateCours/:id - Mettre à jour un cours
router.put("/updateCours/:id", updateCours);

// DELETE /api/cours/deleteCourse/:id - Supprimer un cours
router.delete("/deleteCourse/:id", deleteCourse);

// ==================== UTILITAIRES ====================
// GET /api/cours/getUserNameByCourseId/:id - Nom de l'enseignant d'un cours
router.get("/getUserNameByCourseId/:id", getUserNameByCourseId);

// GET /api/cours/getUserIdByCourseId/:id - ID de l'enseignant d'un cours
router.get("/getUserIdByCourseId/:id", getUserIdByCourseId);

// ==================== FILTRES ====================
// GET /api/cours/categorie/:idCategorie/cours - Cours par catégorie
router.get("/categorie/:idCategorie/cours", getCoursByCategorie);

// GET /api/cours/by-status/:status - Cours par statut (published/hidden)
router.get("/by-status/:status", getCoursesByStatus);

// PUT /api/cours/status/:id - Publier/cacher un cours
router.put("/status/:id", updateCourseStatus);

// ==================== ÉTUDIANTS ====================
// GET /api/cours/student-courses/:idUser - Cours suivis par un étudiant
router.get("/student-courses/:idUser", getStudentEnrolledCourses);

// GET /api/cours/etudiants/:idCours - Étudiants inscrits à un cours
router.get("/etudiants/:idCours", getEtudiantsByCours);

// ==================== VALIDATION (COORDINATEUR) ====================
// PUT /api/cours/request-validation/:id - Enseignant demande validation
router.put("/request-validation/:id", requestValidation);

// PUT /api/cours/approve/:id - Coordinateur valide un cours
router.put("/approve/:id", approveCourse);

// PUT /api/cours/reject/:id - Coordinateur rejette un cours
router.put("/reject/:id", rejectCourse);

// GET /api/cours/pending-courses - Liste des cours en attente de validation
router.get("/pending-courses", getPendingCourses);

// GET /api/cours/my-courses-validation/:idUser - Cours d'un enseignant avec statut
router.get("/my-courses-validation/:idUser", getCoursesWithValidationStatus);


export default router;