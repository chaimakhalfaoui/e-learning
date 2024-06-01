import express from "express";
import { createRepense,fetchFirstFalseResponseQuestion ,getQuizScore,deleteResponsesByQuizAndUser,createFalseResponsesForUnansweredQuestions} from "../controllers/repense.js";


const router = express.Router();

router.post("/createRepense", createRepense);
router.get("/fetchFirstFalseResponseQuestion/:idQuiz/:idUser", fetchFirstFalseResponseQuestion);
router.get("/getQuizScore/:idQuiz/:idUser", getQuizScore);
router.delete("/deleteResponsesByQuizAndUser/:idQuiz/:idUser", deleteResponsesByQuizAndUser);
router.post("/create-false/:idQuiz/:idUser", createFalseResponsesForUnansweredQuestions);






export default router;