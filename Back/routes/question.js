import express from "express";
import { createQuestion,getQuestions,deleteQuestion,updateQuestion } from "../controllers/question.js";


const router = express.Router();

router.post("/createQuestion", createQuestion);
router.get("/getQuestions/:id", getQuestions);
router.delete("/deleteQuestion/:id", deleteQuestion);
router.put("/updateQuestion/:id", updateQuestion);






export default router;