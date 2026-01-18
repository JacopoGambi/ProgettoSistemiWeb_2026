import express from "express";
import { createPrenotazione, getPrenotazioni, deletePrenotazione} from "../controllers/prenotazioni-controller";

const router = express.Router();

// mostra prenotazioni
router.get("/mostraPrenotazioni", getPrenotazioni);
// crea prenotazione
router.post("/creaPrenotazioni", createPrenotazione);
// cancellazione
router.delete("/eliminaPrenotazioni/:id", deletePrenotazione);

export default router;