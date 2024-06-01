import express from "express";
import {createCertificate,getCertificateByIds } from "../controllers/certaficat.js";


const router = express.Router();

router.post("/createCertificate", createCertificate);
router.get('/getCertificateByIds/:idCours/:idUser', getCertificateByIds);



export default router;