<template>
  <div class="contatti-page">
    <div v-if="!isLoggedIn" class="login-prompt-section">
      <div class="login-prompt-card">
        <i class="bi bi-chat-dots login-icon"></i>
        <h3>Accedi per chattare</h3>
        <p>Devi essere loggato per accedere alla chat con lo staff dell'hotel.</p>
        <router-link to="/scelta-accesso" class="btn btn-login-required">
          <i class="bi bi-box-arrow-in-right"></i> Vai alla pagina di accesso
        </router-link>
      </div>
    </div>

    <div v-else class="chat-wrapper">
      <div class="chat-container">
        <div class="chat-header">
          <h2 v-if="userType === 'cliente'">
            <i class="bi bi-headset"></i> Contatta la Struttura
          </h2>
          <h2 v-else>
            <i class="bi bi-chat-left-text"></i> Rispondi ai Clienti
          </h2>
          <div class="connection-status" :class="{ connected: isConnected }">
            <span class="status-dot"></span>
            {{ isConnected ? 'Connesso' : 'Disconnesso' }}
          </div>
        </div>

        <div class="chat-body">
          <aside class="users-sidebar">
            <h4><i class="bi bi-people"></i> Online ({{ connectedUsers.length }})</h4>
            <ul class="user-list">
              <li v-for="user in connectedUsers" :key="user.socketId" class="user-item">
                <span class="user-badge" :class="user.userType">
                  {{ user.userType === 'dipendente' ? 'Staff' : 'Cliente' }}
                </span>
                <span class="user-name">{{ user.username }}</span>
                <span v-if="user.username === username" class="you-badge">(tu)</span>
              </li>
            </ul>
          </aside>

          <main class="messages-area">
            <div class="messages-container" ref="messagesContainer">
              <div v-if="messages.length === 0" class="empty-chat">
                <i class="bi bi-chat-square-text"></i>
                <p>Nessun messaggio ancora. Inizia la conversazione!</p>
              </div>

              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message"
                :class="{
                  'own-message': msg.username === username,
                  'staff-message': msg.userType === 'dipendente'
                }"
              >
                <div class="message-header">
                  <span class="message-author">
                    <span class="author-badge" :class="msg.userType">
                      {{ msg.userType === 'dipendente' ? 'Staff' : 'Cliente' }}
                    </span>
                    {{ msg.username }}
                  </span>
                  <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                </div>
                <div class="message-content">{{ msg.message }}</div>
              </div>
            </div>

            <div v-if="typingUsersFiltered.length > 0" class="typing-indicator">
              <span class="typing-dots">
                <span></span><span></span><span></span>
              </span>
              {{ typingIndicatorText }}
            </div>

            <div class="message-input-area">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Scrivi un messaggio..."
                @keyup.enter="sendMessage"
                @input="handleTyping"
                @blur="stopTyping"
                :disabled="!isConnected"
                class="message-input"
              >
              <button
                @click="sendMessage"
                :disabled="!isConnected || !newMessage.trim()"
                class="btn-send"
              >
                <i class="bi bi-send-fill"></i>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../types';
import { ConnectedUser } from '../types';

const username = ref(localStorage.getItem('username') || '');
const userType = ref<'cliente' | 'dipendente'>(
  (localStorage.getItem('tipo') as 'cliente' | 'dipendente') || 'cliente'
);
const isLoggedIn = computed(() => !!username.value);

let socket: Socket | null = null;
const isConnected = ref(false);

const messages = ref<ChatMessage[]>([]);
const connectedUsers = ref<ConnectedUser[]>([]);
const typingUsers = ref<string[]>([]);
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

const typingUsersFiltered = computed(() =>
  typingUsers.value.filter(u => u !== username.value)
);

const typingIndicatorText = computed(() => {
  const others = typingUsersFiltered.value;
  if (others.length === 0) return '';
  if (others.length === 1) return `${others[0]} sta scrivendo...`;
  if (others.length === 2) return `${others[0]} e ${others[1]} stanno scrivendo...`;
  return `${others.length} utenti stanno scrivendo...`;
});

function formatTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function scrollToBottom(): void {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

// Inizializza connessione socket
function initSocket(): void {
  if (!isLoggedIn.value) return;

  // Connetti al server socket
  socket = io({
    withCredentials: true
  });

  // Connessione stabilita
  socket.on('connect', () => {
    isConnected.value = true;
    // Entra nella chat 
    socket?.emit('user:join', {
      username: username.value,
      userType: userType.value
    });
  });

  // Connessione persa
  socket.on('disconnect', () => {
    isConnected.value = false;
  });

  // Storico messaggi
  socket.on('chat:history', (history: ChatMessage[]) => {
    messages.value = history;
    scrollToBottom();
  });

  // Nuovo messaggio
  socket.on('chat:message', (msg: ChatMessage) => {
    messages.value.push(msg);
    scrollToBottom();
  });

  // Aggiorna lista utenti connessi
  socket.on('users:list', (users: ConnectedUser[]) => {
    connectedUsers.value = users;
  });

  // Aggiorna utenti che scrivono
  socket.on('users:typing', (users: string[]) => {
    typingUsers.value = users;
  });

  // Notifica utente entrato
  socket.on('user:joined', (data: { username: string; userType: string }) => {
    console.log(`${data.username} si è unito alla chat`);
  });

  // Notifica utente uscito
  socket.on('user:left', (data: { username: string }) => {
    console.log(`${data.username} ha lasciato la chat`);
  });

  // Gestione errori
  socket.on('error', (error: { message: string }) => {
    console.error('Socket error:', error.message);
  });
}

// Invia messaggio
function sendMessage(): void {
  if (!newMessage.value.trim() || !socket || !isConnected.value) return;

  socket.emit('chat:message', newMessage.value.trim());
  newMessage.value = '';
  stopTyping();
}

// Gestisci indicatore typing
function handleTyping(): void {
  if (!socket || !isConnected.value) return;

  socket.emit('typing:start');

  // Cancella timeout esistente
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  // Smetti di scrivere dopo 2 secondi di inattività
  typingTimeout = setTimeout(() => {
    stopTyping();
  }, 2000);
}

// Stop typing
function stopTyping(): void {
  if (!socket) return;

  socket.emit('typing:stop');

  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
}

// Pulizia 
function cleanup(): void {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  if (socket) {
    socket.emit('user:leave');
    socket.disconnect();
    socket = null;
  }
}

// Auto-scroll su nuovi messaggi
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// Lifecycle
onMounted(() => {
  if (isLoggedIn.value) {
    initSocket();
  }
});

onUnmounted(() => {
  cleanup();
});
</script>