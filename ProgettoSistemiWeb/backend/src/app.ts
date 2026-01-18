import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import autenticazioneRouter from "./routes/autenticazione-router";
import camereRouter from "./routes/camere-router";
import prenotazioniRouter from "./routes/prenotazioni-router";
import loginRouter from "./routes/login-router";
import recensioniRouter from "./routes/recensioni-router";
import spiaggiaRouter from "./routes/spiaggia-router";
import menuRouter from "./routes/menu-router";
import ristoranteRouter from "./routes/ristorante-router";
import { setupChatSocket } from "./controllers/chat-controller";
import { db } from "./utils/db";

const app: Express = express();
const port: number = 3000;

//HTTP server per supportare Socket.io
const httpServer = createServer(app);

//Inizializzazione Socket.io 
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

//Middleware per i dati
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Rotte api
app.use("/api", autenticazioneRouter); 
app.use("/api", camereRouter);
app.use("/api", prenotazioniRouter);
app.use("/api", recensioniRouter);
app.use("/api", spiaggiaRouter);
app.use("/api", menuRouter);          
app.use("/api", ristoranteRouter);    

//Gestione file statici
app.use(express.static("public"));

//Inizializza chat Socket.io
setupChatSocket(io);

//Avvio server
httpServer.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
