import express from "express";
import { createCours,getAllCourses,getAllCoursesId,getCourse,getUserNameByCourseId,getUserIdByCourseId,deleteCourse,updateCours, getCoursByCategorie, updateCourseStatus, getCoursesByStatus  } from "../controllers/cours.js";


const router = express.Router();

router.post("/createCours", createCours);
router.get("/", getAllCourses);
router.get("/getAllCoursesId/:id", getAllCoursesId);
router.get("/getCourse/:id", getCourse);
router.get("/getUserNameByCourseId/:id", getUserNameByCourseId);
router.get("/getUserIdByCourseId/:id", getUserIdByCourseId);
router.delete("/deleteCourse/:id", deleteCourse);
router.put("/updateCours/:id", updateCours);

// Route pour récupérer les cours d'une catégorie
router.get("/categorie/:idCategorie/cours", getCoursByCategorie);

router.put("/status/:id", updateCourseStatus);
router.get("/by-status/:status", getCoursesByStatus);




export default router;