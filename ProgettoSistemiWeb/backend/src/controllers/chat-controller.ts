import { Server, Socket } from 'socket.io';

// Interfaccia per i messaggi
interface ChatMessage {
  id: string;
  username: string;
  userType: 'cliente' | 'dipendente';
  message: string;
  timestamp: Date;
}

// Interfaccia per utenti connessi
interface ConnectedUser {
  socketId: string;
  username: string;
  userType: 'cliente' | 'dipendente';
}

// Storage in memoria 
const connectedUsers: Map<string, ConnectedUser> = new Map();
const typingUsers: Set<string> = new Set();
const messageHistory: ChatMessage[] = [];
const MAX_HISTORY = 50;

// Genera ID univoco per messaggio
function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function setupChatSocket(io: Server): void {

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connesso: ${socket.id}`);

    // Utente entra nella chat
    socket.on('user:join', (data: { username: string; userType: 'cliente' | 'dipendente' }) => {
      const { username, userType } = data;

      // Salva info utente
      connectedUsers.set(socket.id, {
        socketId: socket.id,
        username,
        userType
      });

      // Entra nella stanza pubblica
      socket.join('public-chat');

      // Invia storico messaggi al nuovo utente
      socket.emit('chat:history', messageHistory);

      // Broadcast lista utenti aggiornata
      io.to('public-chat').emit('users:list', Array.from(connectedUsers.values()));

      // Notifica altri utenti
      socket.to('public-chat').emit('user:joined', { username, userType });

      console.log(`Utente connesso: ${username} (${userType})`);
    });

    // Gestione messaggi in arrivo
    socket.on('chat:message', (messageText: string) => {
      const user = connectedUsers.get(socket.id);

      if (!user) {
        socket.emit('error', { message: 'Utente non autenticato' });
        return;
      }

      // Crea oggetto messaggio
      const chatMessage: ChatMessage = {
        id: generateMessageId(),
        username: user.username,
        userType: user.userType,
        message: messageText.trim(),
        timestamp: new Date()
      };

      // Salva nello storico 
      messageHistory.push(chatMessage);
      if (messageHistory.length > MAX_HISTORY) {
        messageHistory.shift();
      }

      // Broadcast 
      io.to('public-chat').emit('chat:message', chatMessage);

      // Utente smette di scrivere dopo invio
      typingUsers.delete(user.username);
      io.to('public-chat').emit('users:typing', Array.from(typingUsers));
    });

    // Indicatore "sta scrivendo" - inizio
    socket.on('typing:start', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        typingUsers.add(user.username);
        socket.to('public-chat').emit('users:typing', Array.from(typingUsers));
      }
    });

    // Indicatore "sta scrivendo" - fine
    socket.on('typing:stop', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        typingUsers.delete(user.username);
        socket.to('public-chat').emit('users:typing', Array.from(typingUsers));
      }
    });

    // Utente esce
    socket.on('user:leave', () => {
      handleDisconnect(socket, io);
    });

    // Disconnessione
    socket.on('disconnect', () => {
      handleDisconnect(socket, io);
    });
  });
}

function handleDisconnect(socket: Socket, io: Server): void {
  const user = connectedUsers.get(socket.id);

  if (user) {
    // Rimuovi da utenti che scrivono
    typingUsers.delete(user.username);

    // Rimuovi da utenti connessi
    connectedUsers.delete(socket.id);

    // Notifica altri
    io.to('public-chat').emit('user:left', { username: user.username });
    io.to('public-chat').emit('users:list', Array.from(connectedUsers.values()));
    io.to('public-chat').emit('users:typing', Array.from(typingUsers));

    console.log(`Utente disconnesso: ${user.username}`);
  }
}
