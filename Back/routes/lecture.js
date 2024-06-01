import express from "express";
import { createLecture,getLectureCours,getTop6CoursesByLecture } from "../controllers/lecture.js";


const router = express.Router();

router.post("/createLecture", createLecture);
router.get("/getLectureCours/:id", getLectureCours);
router.get("/getTop6CoursesByLecture", getTop6CoursesByLecture);







export default router;