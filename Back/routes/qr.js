// routes/qr.js
import express from "express";
import {
    createMessage,
    getMessagesByCours,
    deleteMessage
} from "../controllers/qr.js";

const router = express.Router();

router.post("/createMessage", createMessage);
router.get("/getMessagesByCours/:idCours", getMessagesByCours);
router.delete("/deleteMessage/:id", deleteMessage);

export default router;