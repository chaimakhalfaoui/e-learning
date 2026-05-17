// routes/qr.js
import express from "express";
<<<<<<< HEAD
import {
    createMessage,
    getMessagesByCours,
    deleteMessage
} from "../controllers/qr.js";
=======
import { createMessage, getMessages } from "../controllers/qr.js";

>>>>>>> 08659bf02d98d91ae50074d86f666aa0ce63aeb7

const router = express.Router();

router.post("/createMessage", createMessage);
router.get("/getMessagesByCours/:idCours", getMessagesByCours);
router.delete("/deleteMessage/:id", deleteMessage);

export default router;
