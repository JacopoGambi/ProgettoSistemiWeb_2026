import express from "express";
import { getCamere, updateCamera } from "../controllers/camere-controller";

const router = express.Router();

// rotta per accedere alle camere (GET)
router.get("/camere", getCamere);
// rotta per aggiornare le camere (PUT) 
router.put("/aggiornaCamera/:id", updateCamera);

export default router;