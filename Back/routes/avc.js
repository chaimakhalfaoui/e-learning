import express from "express";
import { createOrUpdateAvc,getAvcByIds } from "../controllers/avc.js";


const router = express.Router();

router.post("/createOrUpdateAvc", createOrUpdateAvc);
router.get('/avc/:idCours/:iduser', getAvcByIds);



export default router;