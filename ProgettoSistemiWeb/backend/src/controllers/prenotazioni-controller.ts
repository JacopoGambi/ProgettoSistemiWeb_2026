import { Request, Response } from "express";
import { connection } from "../utils/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getUser } from "../utils/auth";

//crea prenotazione
export const createPrenotazione = async(req: Request, res: Response) =>{
  const { idcamera, username, datainizio, datafine, ospiti } = req.body;
  const sql = "INSERT INTO prenotazioni (idcamera, username, datainizio, datafine, ospiti) VALUES (?, ?, ?, ?, ?)"
      
    connection.execute(sql, [idcamera, username, datainizio, datafine, ospiti], (err, results) => {
        if (err) {
            console.error("Errore DB:", err);
            return res.status(500).json({
                success: false,
                message: "Errore Server: " + err.message
            });
        }
        res.status(201).json({
            success: true,
            message: "Prenotazione creata con successo!",
            id: (results as any).insertId
          });
    });
};


//visualizza prenotazioni
export const getPrenotazioni = async (req: Request, res: Response) => {
  const user = getUser(req, res);

  if (!user) {
    return res.status(401).json({ message: "Non autenticato" });
  }

  // dipendente: vede tutte
  if (user.ruolo === "dipendente") {
    const sql = "SELECT * FROM prenotazioni";
    return connection.execute(sql, [], (err, results) => {
      if (err) {
        console.error("Errore DB:", err);
        return res.status(500).send("Errore Server: " + err.message);
      }
      res.status(200).json(results);
    });
  }

  // cliente: vede solo le sue
  const sql = "SELECT * FROM prenotazioni WHERE username = ?";
  connection.execute(sql, [user.username], (err, results) => {
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore Server: " + err.message);
    }
    res.status(200).json(results);
  });
};


//elimina prenotazione 
export const deletePrenotazione = async (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = "DELETE FROM prenotazioni WHERE idprenotazione = ?";

  connection.execute(sql, [id], (err, results) => { 
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore Server: " + err.message);
    }
    const info=results as any ;
    if (info.affectedRows === 0) { //nessuna modifica (no riga eliminata)
      return res.status(404).json({ message: "Prenotazione non trovata" });
    }
    res.status(200).json({ message: "Prenotazione eliminata con successo!" });
  });
  };