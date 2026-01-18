import { Router } from "express";
import { createPrenotazioneRistorante, deletePrenotazioneRistorante, getTuttePrenotazioniRistorante, getMiePrenotazioniRistorante } from "../controllers/ristorante-controller"; 

const router = Router();

router.post("/ristorante/creaPrenotazioni", createPrenotazioneRistorante);
router.delete("/ristorante/eliminaPrenotazioni/:idtavolo", deletePrenotazioneRistorante);
router.get('/ristorante/tutte-prenotazioni', getTuttePrenotazioniRistorante);
router.get('/ristorante/mie-prenotazioni/:username', getMiePrenotazioniRistorante);

export default router;
