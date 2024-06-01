import express from "express";
import { createEvent,getAllEvents,getAllEventsId,getLatestEvents,deleteEvent,updateEvent,getEventById } from "../controllers/event.js";


const router = express.Router();

router.post("/createEvent", createEvent);
router.get("/getAllEvents", getAllEvents);
router.get("/getAllEventsId/:id", getAllEventsId);
router.get("/getLatestEvents", getLatestEvents);
router.delete("/deleteEvent/:id", deleteEvent);
router.put("/updateEvent/:id", updateEvent);
router.get("/getEventById/:id", getEventById);


export default router;