import type { Request, Response } from "express";
import { connection } from "../utils/db";

// Ritorna la lista degli ombrelloni occupati in un intervallo date 
export function getOmbrelloniOccupati(req: Request, res: Response) {
  const { datainizio, datafine } = req.query;

  if (!datainizio || !datafine) {
    return res.status(400).json({ error: "Parametri richiesti: datainizio, datafine" });
  }

  // Due periodi si sovrappongono 
  const sql = `
    SELECT DISTINCT ombrellone
    FROM prenotazioni_spiaggia
    WHERE NOT (datafine < ? OR datainizio > ?)
  `;

  connection.query(sql, [String(datainizio), String(datafine)], (err, results: any) => {
    if (err) {
      console.error("Errore SQL nella GET /spiaggia/occupati:", (err as any).message);
      return res.status(500).json({ error: "Errore database" });
    }

    const occupied = (results || []).map((r: any) => r.ombrellone);
    return res.json(occupied);
  });
}

// Salvataggio prenotazione spiaggia
export function createPrenotazioneSpiaggia(req: Request, res: Response) {
  const { username, ombrellone, datainizio, datafine } = req.body;

  if (!username || !ombrellone || !datainizio || !datafine) {
    return res
      .status(400)
      .json({ success: false, error: "Campi richiesti: username, ombrellone, datainizio, datafine" });
  }
  if (datafine < datainizio) {
    return res.status(400).json({ success: false, error: "Intervallo date non valido" });
  }

  // Controllo conflitto
  const conflictSql = `SELECT COUNT(*) as cnt FROM prenotazioni_spiaggia WHERE ombrellone = ? AND NOT (datafine < ? OR datainizio > ?)`;

  connection.query(conflictSql, [String(ombrellone), String(datainizio), String(datafine)], (err, results: any) => {
    if (err) {
      console.error("Errore SQL nel controllo conflitto:", (err as any).message);
      return res.status(500).json({ success: false, error: "Errore database" });
    }

    const cnt = results?.[0]?.cnt ?? 0;
    if (cnt > 0) {
      return res.status(409).json({ success: false, error: "Ombrellone gia' prenotato per il periodo selezionato" });
    }

    // Inserimento
    const insertSql = `INSERT INTO prenotazioni_spiaggia (username, ombrellone, datainizio, datafine) VALUES (?, ?, ?, ?)`;

    connection.query(insertSql, [String(username), String(ombrellone), String(datainizio), String(datafine)], (err2) => {
      if (err2) {
        console.error("Errore SQL nella POST /spiaggia/prenotazioni:", (err2 as any).message);
        return res.status(500).json({ success: false, error: (err2 as any).message });
      }
      return res.json({ success: true });
    });
  });
}

// Get tutte le prenotazioni spiaggia (per staff)
export function getTuttePrenotazioniSpiaggia(req: Request, res: Response) {
  const sql = "SELECT * FROM prenotazioni_spiaggia ORDER BY datainizio DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Errore DB:", (err as any).message);
      return res.status(500).send("Errore Server: " + (err as any).message);
    }
    res.status(200).json(results);
  });
}

// Get prenotazioni spiaggia per un cliente specifico
export function getMiePrenotazioniSpiaggia(req: Request, res: Response) {
  const { username } = req.params;

  const sql = "SELECT * FROM prenotazioni_spiaggia WHERE username = ? ORDER BY datainizio DESC";

  connection.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Errore DB:", (err as any).message);
      return res.status(500).send("Errore Server: " + (err as any).message);
    }
    res.status(200).json(results);
  });
}

// Elimina prenotazione spiaggia
export function deletePrenotazioneSpiaggia(req: Request, res: Response) {
  const { idprenotazione } = req.params;
  const sql = "DELETE FROM prenotazioni_spiaggia WHERE idprenotazione = ?";

  connection.query(sql, [idprenotazione], (err, results: any) => {
    if (err) {
      console.error("Errore DB:", (err as any).message);
      return res.status(500).json({
        success: false,
        message: "Errore Server: " + (err as any).message
      });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Prenotazione non trovata"
      });
    }
    res.status(200).json({
      success: true,
      message: "Prenotazione eliminata con successo!"
    });
  });
}
