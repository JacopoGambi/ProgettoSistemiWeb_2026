<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { prenotazioni } from '../types';
  import { prenotazioni_ristorante } from '../types';
  import { prenotazioni_spiaggia } from '../types';
  
  const listaPrenotazioni = ref<prenotazioni[]>([]);
  const prenotazioniRistorante = ref<prenotazioni_ristorante[]>([]);
  const prenotazioniSpiaggia = ref<prenotazioni_spiaggia[]>([]);
  
  const username = localStorage.getItem('username');
  const tipo = localStorage.getItem('tipo');
  
  // Messaggi ristorante
  const successMessageRistorante = ref('');
  const errorMessageRistorante = ref('');
  const eliminandoPrenotazioneRistorante = ref(false);
  
  // Messaggi spiaggia
  const successMessageSpiaggia = ref('');
  const errorMessageSpiaggia = ref('');
  const eliminandoPrenotazioneSpiaggia = ref(false);
  
  const caricaPrenotazioni = async () => {
    if (!tipo) {
      console.error('Dati utente non trovati nel localStorage');
      return;
    }
  
    try {
      const res = await axios.get('/api/mostraPrenotazioni', {
        withCredentials: true
      });
  
      listaPrenotazioni.value = res.data;
    } catch (err) {
      console.error('Errore caricamento camere:', err);
    }
  };
  
  const cancellaPrenotazione = async (id: number) => {
    const messaggio =
      tipo === 'cliente'
        ? 'Vuoi davvero annullare la tua prenotazione?'
        : 'Sei sicuro di voler eliminare questa prenotazione utente?';
  
    if (!confirm(messaggio)) return;
  
    try {
      await axios.delete(`/api/eliminaPrenotazioni/${id}`, { withCredentials: true });
      await caricaPrenotazioni();
    } catch (err) {
      console.error('Errore cancellazione camera:', err);
    }
  };
  
  // Prenotazioni risotrante
  const caricaPrenotazioniRistorante = async () => {
    try {
      if (!username || !tipo) return;
  
      let url = '';
      if (tipo === 'dipendente') {
        url = '/api/ristorante/tutte-prenotazioni';
      } else if (tipo === 'cliente') {
        url = `/api/ristorante/mie-prenotazioni/${username}`;
      }
  
      if (!url) return;
  
      const response = await axios.get(url, { withCredentials: true });
      prenotazioniRistorante.value = response.data;
    } catch (err) {
      console.error('Errore nel caricamento delle prenotazioni ristorante:', err);
      errorMessageRistorante.value = 'Errore nel caricamento delle prenotazioni del ristorante';
    }
  };
  
  const eliminaPrenotazioneRistorante = async (p: prenotazioni_ristorante) => {
    const msg =
      tipo === 'cliente'
        ? `Vuoi davvero annullare la prenotazione del tavolo #${p.idtavolo} per il ${formatData(p.data)} alle ${formatOra(p.ora)}?`
        : `Sei sicuro di voler eliminare la prenotazione del tavolo #${p.idtavolo}?`;
  
    if (!confirm(msg)) return;
  
    eliminandoPrenotazioneRistorante.value = true;
    errorMessageRistorante.value = '';
    successMessageRistorante.value = '';
  
    try {
      const response = await axios.delete(
        `/api/ristorante/eliminaPrenotazioni/${p.idtavolo}`,
        { withCredentials: true }
      );
  
      if (response.data?.success) {
        successMessageRistorante.value =
          response.data.message || 'Prenotazione eliminata con successo!';
      } else {
        successMessageRistorante.value = 'Prenotazione eliminata!';
      }
  
      await caricaPrenotazioniRistorante();
  
      setTimeout(() => {
        successMessageRistorante.value = '';
      }, 3000);
    } catch (err: any) {
      console.error("Errore nell'eliminazione della prenotazione ristorante:", err);
      errorMessageRistorante.value =
        err.response?.data?.message || "Errore durante l'eliminazione della prenotazione";
    } finally {
      eliminandoPrenotazioneRistorante.value = false;
    }
  };
  
  // Prenotazioni spiaggia
  const caricaPrenotazioniSpiaggia = async () => {
    try {
      if (!username || !tipo) return;
  
      let url = '';
      if (tipo === 'dipendente') {
        url = '/api/spiaggia/tutte-prenotazioni';
      } else if (tipo === 'cliente') {
        url = `/api/spiaggia/mie-prenotazioni/${username}`;
      }
  
      if (!url) return;
  
      const response = await axios.get(url, { withCredentials: true });
      prenotazioniSpiaggia.value = response.data;
    } catch (err) {
      console.error('Errore nel caricamento delle prenotazioni spiaggia:', err);
      errorMessageSpiaggia.value = 'Errore nel caricamento delle prenotazioni della spiaggia';
    }
  };
  
  const eliminaPrenotazioneSpiaggia = async (p: prenotazioni_spiaggia) => {
    const msg =
      tipo === 'cliente'
        ? `Vuoi davvero annullare la prenotazione dell'ombrellone ${p.ombrellone}?`
        : `Sei sicuro di voler eliminare la prenotazione dell'ombrellone ${p.ombrellone}?`;
  
    if (!confirm(msg)) return;
  
    eliminandoPrenotazioneSpiaggia.value = true;
    errorMessageSpiaggia.value = '';
    successMessageSpiaggia.value = '';
  
    try {
      const response = await axios.delete(
        `/api/spiaggia/prenotazioni/${p.idprenotazione}`,
        { withCredentials: true }
      );
  
      if (response.data?.success) {
        successMessageSpiaggia.value =
          response.data.message || 'Prenotazione eliminata con successo!';
      } else {
        successMessageSpiaggia.value = 'Prenotazione eliminata!';
      }
  
      await caricaPrenotazioniSpiaggia();
  
      setTimeout(() => {
        successMessageSpiaggia.value = '';
      }, 3000);
    } catch (err: any) {
      console.error("Errore nell'eliminazione della prenotazione spiaggia:", err);
      errorMessageSpiaggia.value =
        err.response?.data?.message || "Errore durante l'eliminazione della prenotazione";
    } finally {
      eliminandoPrenotazioneSpiaggia.value = false;
    }
  };
  
  const formatData = (data: string) => {
    const d = new Date(data);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const formatOra = (ora: string) => ora.substring(0, 5);
  
  onMounted(() => {
    caricaPrenotazioni();
    caricaPrenotazioniRistorante();
    caricaPrenotazioniSpiaggia();
  });
  </script>
  
  <template>
    <div class="prenotazioni-page">
      <section class="prenotazioni-hero">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1><i class="bi bi-calendar-check"></i> {{ tipo === 'cliente' ? 'Le mie Prenotazioni' : 'Gestione Prenotazioni' }}</h1>
          <p>{{ tipo === 'cliente' ? 'Visualizza e gestisci le tue prenotazioni' : 'Gestisci tutte le prenotazioni degli ospiti' }}</p>
        </div>
      </section>
  
      <div class="prenotazioni-container">
        <section class="booking-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="bi bi-house-door"></i>
            </div>
            <h2>Prenotazioni Camere</h2>
          </div>
  
          <div v-if="listaPrenotazioni.length === 0" class="empty-state">
            <i class="bi bi-inbox"></i>
            <p v-if="tipo === 'cliente'">Non hai ancora effettuato nessuna prenotazione.</p>
            <p v-else>Non ci sono prenotazioni nel sistema.</p>
            <router-link v-if="tipo === 'cliente'" to="/camere" class="btn-action">
              <i class="bi bi-plus-lg"></i> Prenota ora
            </router-link>
          </div>
  
          <div v-else class="table-wrapper">
            <table class="booking-table">
              <thead>
                <tr>
                  <th v-if="tipo !== 'cliente'">Cliente</th>
                  <th>Camera</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Ospiti</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in listaPrenotazioni" :key="p.idprenotazione">
                  <td v-if="tipo !== 'cliente'"><strong>{{ p.username }}</strong></td>
                  <td><span class="badge-room">Camera #{{ p.idcamera }}</span></td>
                  <td>{{ new Date(p.datainizio).toLocaleDateString('it-IT') }}</td>
                  <td>{{ new Date(p.datafine).toLocaleDateString('it-IT') }}</td>
                  <td>{{ p.ospiti }}</td>
                  <td>
                    <button @click="cancellaPrenotazione(p.idprenotazione)" class="btn-delete">
                      <i class="bi bi-trash3"></i>
                      {{ tipo === 'cliente' ? 'Annulla' : 'Elimina' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
  
        <section class="booking-section">
          <div class="section-header">
            <div class="section-icon ristorante">
              <i class="bi bi-cup-hot"></i>
            </div>
            <h2>Prenotazioni Ristorante</h2>
          </div>
  
          <div v-if="successMessageRistorante" class="alert alert-success">
            <i class="bi bi-check-circle"></i> {{ successMessageRistorante }}
          </div>
          <div v-if="errorMessageRistorante" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> {{ errorMessageRistorante }}
          </div>
  
          <div v-if="prenotazioniRistorante.length === 0" class="empty-state">
            <i class="bi bi-inbox"></i>
            <p>Nessuna prenotazione presente</p>
            <router-link v-if="tipo === 'cliente'" to="/ristorante" class="btn-action">
              <i class="bi bi-plus-lg"></i> Prenota un tavolo
            </router-link>
          </div>
  
          <div v-else class="table-wrapper">
            <table class="booking-table">
              <thead>
                <tr>
                  <th>Tavolo</th>
                  <th v-if="tipo === 'dipendente'">Cliente</th>
                  <th>Data</th>
                  <th>Ora</th>
                  <th>Ospiti</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in prenotazioniRistorante" :key="`${r.idtavolo}-${r.data}-${r.ora}-${r.username}`">
                  <td><span class="badge-table">Tavolo #{{ r.idtavolo }}</span></td>
                  <td v-if="tipo === 'dipendente'"><strong>{{ r.username }}</strong></td>
                  <td>{{ formatData(r.data) }}</td>
                  <td>{{ formatOra(r.ora) }}</td>
                  <td>{{ r.ospiti }}</td>
                  <td>
                    <button
                      @click="eliminaPrenotazioneRistorante(r)"
                      class="btn-delete"
                      :disabled="eliminandoPrenotazioneRistorante"
                    >
                      <i class="bi bi-trash3"></i>
                      {{ tipo === 'cliente' ? 'Annulla' : 'Elimina' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
  

        <section class="booking-section">
          <div class="section-header">
            <div class="section-icon spiaggia">
              <i class="bi bi-umbrella"></i>
            </div>
            <h2>Prenotazioni Spiaggia</h2>
          </div>
  
          <div v-if="successMessageSpiaggia" class="alert alert-success">
            <i class="bi bi-check-circle"></i> {{ successMessageSpiaggia }}
          </div>
          <div v-if="errorMessageSpiaggia" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> {{ errorMessageSpiaggia }}
          </div>
  
          <div v-if="prenotazioniSpiaggia.length === 0" class="empty-state">
            <i class="bi bi-inbox"></i>
            <p>Nessuna prenotazione presente</p>
            <router-link v-if="tipo === 'cliente'" to="/spiaggia" class="btn-action">
              <i class="bi bi-plus-lg"></i> Prenota un ombrellone
            </router-link>
          </div>
  
          <div v-else class="table-wrapper">
            <table class="booking-table">
              <thead>
                <tr>
                  <th v-if="tipo === 'dipendente'">Cliente</th>
                  <th>Ombrellone</th>
                  <th>Data Inizio</th>
                  <th>Data Fine</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in prenotazioniSpiaggia" :key="s.idprenotazione">
                  <td v-if="tipo === 'dipendente'"><strong>{{ s.username }}</strong></td>
                  <td><span class="badge-umbrella">{{ s.ombrellone }}</span></td>
                  <td>{{ formatData(s.datainizio) }}</td>
                  <td>{{ formatData(s.datafine) }}</td>
                  <td>
                    <button
                      @click="eliminaPrenotazioneSpiaggia(s)"
                      class="btn-delete"
                      :disabled="eliminandoPrenotazioneSpiaggia"
                    >
                      <i class="bi bi-trash3"></i>
                      {{ tipo === 'cliente' ? 'Annulla' : 'Elimina' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </template>
  