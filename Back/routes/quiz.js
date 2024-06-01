import express from "express";
import { createQuiz,getQuiz, getQuizId , deleteQuiz,updateQuiz } from "../controllers/quiz.js";


const router = express.Router();

router.post("/createQuiz", createQuiz);
router.get("/getQuiz/:id", getQuiz);
router.get("/getQuizId/:id", getQuizId);
router.delete("/deleteQuiz/:id", deleteQuiz);
router.put("/updateQuiz/:id", updateQuiz);





export default router;