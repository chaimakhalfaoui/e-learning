import express from "express";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/event.js";
import imageRoutes from "./routes/image.js";
import videoRoutes from "./routes/video.js";
import coursRoutes from "./routes/cours.js";
import activiteRoutes from "./routes/activite.js";
import chapitreRoutes from "./routes/chapitre.js";
import questionRoutes from "./routes/question.js";
import repenseRoutes from "./routes/repense.js";
import lectureRoutes from "./routes/lecture.js";
import qrRoutes from "./routes/qr.js";
import avcRoutes from "./routes/avc.js";
import quizRoutes from "./routes/quiz.js";
import certaficatRoutes from "./routes/certaficat.js";
import commentaireRoutes from "./routes/commentaire.js";
import cookieParser from "cookie-parser";




import corsMiddleware from './middleware/cors.js'; 

const app = express();

app.use(corsMiddleware);

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/cours", coursRoutes);
app.use("/api/chapitre", chapitreRoutes);
app.use("/api/activite", activiteRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/repense", repenseRoutes);
app.use("/api/lecture", lectureRoutes);
app.use("/api/avc", avcRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/certaficat", certaficatRoutes);
app.use("/api/commentaire", commentaireRoutes);


app.listen(8801, () => {
  console.log("Connected!");
});