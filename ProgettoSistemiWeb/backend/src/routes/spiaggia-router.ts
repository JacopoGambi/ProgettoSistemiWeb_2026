import express from "express";
import {
  createPrenotazioneSpiaggia,
  getOmbrelloniOccupati,
  getTuttePrenotazioniSpiaggia,
  getMiePrenotazioniSpiaggia,
  deletePrenotazioneSpiaggia,
} from "../controllers/spiaggia-controller";

const router = express.Router();

// Lista degli ombrelloni occupati in un intervallo date 
router.get("/spiaggia/occupati", getOmbrelloniOccupati);
// Salvataggio prenotazione spiaggia
router.post("/spiaggia/prenotazioni", createPrenotazioneSpiaggia);
// Get tutte le prenotazioni spiaggia (staff)
router.get("/spiaggia/tutte-prenotazioni", getTuttePrenotazioniSpiaggia);
// Get prenotazioni spiaggia per un cliente
router.get("/spiaggia/mie-prenotazioni/:username", getMiePrenotazioniSpiaggia);
// Delete prenotazione spiaggia
router.delete("/spiaggia/prenotazioni/:idprenotazione", deletePrenotazioneSpiaggia);

export default router;
