// routes/lecture.js
import express from "express";
import { 
    createLecture,
    getLectureCours,
    getTop6CoursesByLecture,
    getLectureCountByUser,
    getUserEnrolledCourses,
    getLectureById,
    updateLectureProgress,
    deleteLecture,
    getAllCoursesWithCount
} from "../controllers/lecture.js";

const router = express.Router();

router.post("/create", createLecture);                          // S'inscrire à un cours
router.delete("/delete/:id_cours/:id_user", deleteLecture);     // Se désinscrire

router.get("/count/:id", getLectureCours);                      // Nombre d'inscrits à un cours
router.get("/top6", getTop6CoursesByLecture);                   // Top 6 des cours populaires
router.get("/all-with-count", getAllCoursesWithCount);          // Tous les cours avec nb inscrits

router.get("/user/:id_user", getUserEnrolledCourses);           // Cours suivis par un étudiant
router.get("/check/:id_cours/:id_user", getLectureCountByUser); // Vérifier si inscrit
router.get("/details/:id_cours/:id_user", getLectureById);      // Détails inscription

router.put("/progress/:id_cours/:id_user", updateLectureProgress); // Mettre à jour avancement

export default router;