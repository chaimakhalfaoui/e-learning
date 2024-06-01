import express from "express";
import { createMessage,getMessages } from "../controllers/QR.js";


const router = express.Router();

router.post("/createMessage", createMessage);
router.get('/messages/:idCours/:idUser/:idEns', getMessages);






export default router;