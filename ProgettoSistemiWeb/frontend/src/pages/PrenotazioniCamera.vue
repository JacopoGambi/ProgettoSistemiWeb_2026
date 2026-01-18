<template>
  <div class="prenota-container">
    <h1>Seleziona le date per la Camera {{ idcamera }}</h1>

    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div class="prenota-grid">
      <div class="prenota-left">
        <div class="calendar-wrapper">
          <div class="calendar-header">
            <button @click="cambiaMese(-1)">&lt;</button>
            <h3>{{ nomeMeseCorrente }} {{ annoCorrente }}</h3>
            <button @click="cambiaMese(1)">&gt;</button>
          </div>
  
          <div class="calendar-grid">
            <div v-for="giorno in nomiGiorni" :key="giorno" class="day-name">{{ giorno }}</div>
            
            <div v-for="vuoto in spaziIniziali" :key="'v'+vuoto" class="day-empty"></div>
  
            <div 
              v-for="giorno in giorniDelMese" 
              :key="giorno.dataStr"
              class="day-square"
              :class="{
                'today': giorno.isOggi,
                'disabled': giorno.isPassato,
                'selected': isSelezionato(giorno.dataStr),
                'in-range': isInRange(giorno.dataStr)
              }"
              @click="selezionaGiorno(giorno)"
            >
              {{ giorno.numero }}
            </div>
          </div>
        </div>
  
        <div class="booking-summary">
          <p><strong>Check-in:</strong> {{ form.datainizio || 'Seleziona sulla griglia' }}</p>
          <p><strong>Check-out:</strong> {{ form.datafine || 'Seleziona sulla griglia' }}</p>
          
          <div class="form-group">
            <label>Ospiti:</label>
            <input type="number" v-model="form.ospiti" min="1" max="4">
          </div>
  
          <div class="actions">
            <button @click="inviaPrenotazione" :disabled="!form.datafine" class="btn-confirm">
              Conferma Prenotazione
            </button>
            <router-link to="/camere" class="btn-back">Annulla</router-link>
          </div>
        </div>
      </div>

      <div class="prenota-right">
        <div class="room-preview-card">
          <img
            v-if="cameraImage"
            :src="cameraImage"
            :alt="cameraTitle"
            class="room-preview-img"
          >
          <div v-else class="room-preview-placeholder">
            Immagine non disponibile
          </div>
          <div class="room-preview-info">
            <h2>{{ cameraTitle }}</h2>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps(['idcamera']);
const router = useRouter();
const cameraImage = ref<string>('');
const cameraName = ref<string>('');

// messaggi
const successMessage = ref('');
const errorMessage = ref('');

//calendario
const dataVisualizzata = ref(new Date());
const nomiGiorni = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const form = reactive({
  idcamera: props.idcamera,
  username: localStorage.getItem('username'),
  datainizio: '',
  datafine: '',
  ospiti: 1
});

const annoCorrente = computed(() => dataVisualizzata.value.getFullYear());
const nomeMeseCorrente = computed(() => 
  dataVisualizzata.value.toLocaleString('it-IT', { month: 'long' }).toUpperCase()
);

// Funzione per formattare data in YYYY-MM-DD 
const formatDataToYYYYMMDD = (data: Date) => {
  const anno = data.getFullYear();
  const mese = String(data.getMonth() + 1).padStart(2, '0');
  const giorno = String(data.getDate()).padStart(2, '0');
  return `${anno}-${mese}-${giorno}`;
};

const giorniDelMese = computed(() => {
  const giorni = [];
  const ultimoGiorno = new Date(annoCorrente.value, dataVisualizzata.value.getMonth() + 1, 0).getDate();
  const oggiStr = formatDataToYYYYMMDD(new Date());

  for (let i = 1; i <= ultimoGiorno; i++) {
    const data = new Date(annoCorrente.value, dataVisualizzata.value.getMonth(), i);
    const dataStr = formatDataToYYYYMMDD(data);
    giorni.push({
      numero: i,
      dataStr: dataStr,
      isOggi: dataStr === oggiStr,
      isPassato: dataStr < oggiStr
    });
  }
  return giorni;
});

const spaziIniziali = computed(() => {
  let primoGiornoSettimana = new Date(annoCorrente.value, dataVisualizzata.value.getMonth(), 1).getDay();
  return primoGiornoSettimana === 0 ? 6 : primoGiornoSettimana - 1; 
});

//selezione data
const selezionaGiorno = (giorno: any) => {
  if (giorno.isPassato) return;

  if (!form.datainizio || (form.datainizio && form.datafine)) {
    form.datainizio = giorno.dataStr;
    form.datafine = '';
  } else if (giorno.dataStr > form.datainizio) {
    form.datafine = giorno.dataStr;
  } else {
    form.datainizio = giorno.dataStr;
  }
};

const isSelezionato = (dataStr: string) => dataStr === form.datainizio || dataStr === form.datafine;
const isInRange = (dataStr: string) => dataStr > form.datainizio && dataStr < form.datafine;

const cameraTitle = computed(() => cameraName.value || `Camera ${props.idcamera}`);

const cambiaMese = (direzione: number) => {
  dataVisualizzata.value = new Date(annoCorrente.value, dataVisualizzata.value.getMonth() + direzione, 1);
};

const formatData = (data: string) => {
  if (!data) return '';
  const [anno, mese, giorno] = data.split('-');
  return `${giorno}/${mese}/${anno}`;
};

const inviaPrenotazione = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const dataInizioFormatted = formatData(form.datainizio);
    const dataFineFormatted = formatData(form.datafine);

    const res = await axios.post('/api/creaPrenotazioni', form);

    if (res.data.success) {
      successMessage.value = `Prenotazione confermata! Camera ${props.idcamera} prenotata dal ${dataInizioFormatted} al ${dataFineFormatted} per ${form.ospiti} ${form.ospiti === 1 ? 'ospite' : 'ospiti'}.`;

      // Reset del form
      form.datainizio = '';
      form.datafine = '';
      form.ospiti = 1;

      // Scroll per vedere il messaggio
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Nascondi messaggio dopo 6 secondi
      setTimeout(() => {
        successMessage.value = '';
      }, 6000);
    } else {
      errorMessage.value = res.data.message || 'Errore durante la prenotazione.';
    }
  } catch (err: any) {
    console.error('Errore durante la prenotazione:', err);
    errorMessage.value = err.response?.data?.message || 'Errore durante la prenotazione. Riprova più tardi.';
  }
};

const caricaCamera = async () => {
  try {
    const res = await axios.get('/api/camere');
    const match = (res.data || []).find((c: any) => String(c.idcamera) === String(props.idcamera));
    if (match?.imgcamera) {
      cameraImage.value = `/immagini/${match.imgcamera}`;
    }
    if (match?.nomecamera) {
      cameraName.value = match.nomecamera;
    }
  } catch (err) {
    console.error('Errore nel caricamento camera:', err);
  }
};

onMounted(() => {
  caricaCamera();
});
</script>