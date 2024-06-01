import express from "express";
import { createActivite , createActivitei,createActivitev,getAllActiviteId,deleteActivite,updateActiviteText,updateActiviteI,updateActiviteVideo } from "../controllers/activit.js";


const router = express.Router();

router.post("/createActivite", createActivite);
router.post("/createActivitei", createActivitei);
router.post("/createActivitev", createActivitev);
router.get("/getAllActiviteId/:id", getAllActiviteId);
router.delete("/deleteActivite/:id", deleteActivite);
router.put("/updateActiviteText/:id", updateActiviteText);
router.put("/updateActiviteI/:id", updateActiviteI);
router.put("/updateActiviteVideo/:id", updateActiviteVideo);


export default router;