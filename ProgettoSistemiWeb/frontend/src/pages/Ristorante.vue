<template>
  <div class="ristorante-page">
    <section class="ristorante-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>Il Nostro Ristorante</h1>
        <p>Sapori autentici della tradizione romagnola</p>
      </div>
    </section>

    <div class="ristorante-container">
      <section class="info-section">
        <div class="info-grid">
          <div class="info-card">
            <i class="bi bi-clock"></i>
            <h3>Orari</h3>
            <p>Pranzo: 12:00 - 14:30</p>
            <p>Cena: 19:00 - 22:00</p>
          </div>
          <div class="info-card">
            <i class="bi bi-geo-alt"></i>
            <h3>Dove Siamo</h3>
            <p>Piano terra dell'hotel</p>
            <p>Vista giardino</p>
          </div>
          <div class="info-card">
            <i class="bi bi-star"></i>
            <h3>Specialità</h3>
            <p>Cucina romagnola</p>
            <p>Pesce fresco</p>
          </div>
        </div>
      </section>

      <section class="menu-preview-section">
        <div class="menu-preview-content">
          <div class="menu-preview-text">
            <h2>Scopri il Menu</h2>
            <p>
              Il nostro chef prepara ogni giorno piatti della tradizione romagnola
              con ingredienti freschi e di stagione. Dai classici cappelletti al brodo
              alla piadina fatta a mano, passando per il pesce fresco dell'Adriatico.
            </p>
            <router-link to="/menu" class="btn-view-menu">
              <i class="bi bi-book"></i> Visualizza Menu Completo
            </router-link>
          </div>
          <div class="menu-preview-image">
            <img src="/immagini/fotoRistorante.png" alt="Il nostro ristorante" />
          </div>
        </div>
      </section>

      <div v-if="successMessage" class="alert alert-success">
        <i class="bi bi-check-circle-fill"></i>
        {{ successMessage }}
        <button type="button" class="alert-close" @click="successMessage = ''">&times;</button>
      </div>
      <div v-if="errorMessage" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill"></i>
        {{ errorMessage }}
        <button type="button" class="alert-close" @click="errorMessage = ''">&times;</button>
      </div>

      <section v-if="tipoUtente === 'cliente'" class="prenotazione-section">
        <div class="section-header">
          <h2><i class="bi bi-calendar-plus"></i> Prenota un Tavolo</h2>
          <p>Riserva il tuo posto per un'esperienza gastronomica indimenticabile</p>
        </div>

        <form @submit.prevent="creaPrenotazione" class="form-prenotazione">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-people"></i> Numero Ospiti
              </label>
              <input
                v-model.number="formPrenotazione.ospiti"
                type="number"
                class="form-input"
                placeholder="es. 4"
                required
                min="1"
                max="12"
              >
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-calendar-event"></i> Data
              </label>
              <input
                v-model="formPrenotazione.data"
                type="date"
                class="form-input"
                required
                :min="dataMinima"
              >
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-clock"></i> Orario
              </label>
              <select v-model="formPrenotazione.ora" class="form-input" required>
                <option value="" disabled>Seleziona orario</option>
                <optgroup label="Pranzo">
                  <option value="12:00:00">12:00</option>
                  <option value="12:30:00">12:30</option>
                  <option value="13:00:00">13:00</option>
                  <option value="13:30:00">13:30</option>
                </optgroup>
                <optgroup label="Cena">
                  <option value="19:00:00">19:00</option>
                  <option value="19:30:00">19:30</option>
                  <option value="20:00:00">20:00</option>
                  <option value="20:30:00">20:30</option>
                  <option value="21:00:00">21:00</option>
                  <option value="21:30:00">21:30</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div class="form-submit">
            <button type="submit" class="btn-prenota">
              <i class="bi bi-check-circle"></i> Conferma Prenotazione
            </button>
          </div>
        </form>
      </section>

      <section v-else-if="tipoUtente === 'dipendente'" class="notice-section">
        <div class="notice-card staff">
          <div class="notice-icon">
            <i class="bi bi-person-badge"></i>
          </div>
          <h3>Area Staff</h3>
          <p>Sei loggato come <strong>dipendente</strong>.</p>
          <p>Solo i clienti possono effettuare prenotazioni al ristorante.</p>
        </div>
      </section>

      <section v-else class="notice-section">
        <div class="notice-card">
          <div class="notice-icon">
            <i class="bi bi-person-lock"></i>
          </div>
          <h3>Accedi per prenotare</h3>
          <p>Effettua il login come <strong>cliente</strong> per prenotare un tavolo nel nostro ristorante.</p>
          <router-link to="/scelta-accesso" class="btn-login">
            <i class="bi bi-box-arrow-in-right"></i> Vai al Login
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'Ristorante',
  data() {
    return {
      tipoUtente: localStorage.getItem('tipo'),
      username: localStorage.getItem('username'),
      formPrenotazione: {
        ospiti: null as number | null,
        data: '',
        ora: ''
      },
      successMessage: '',
      errorMessage: ''
    };
  },
  computed: {
    dataMinima() {
      const oggi = new Date();
      return oggi.toISOString().split('T')[0];
    }
  },
  methods: {
    async creaPrenotazione() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.formPrenotazione.ospiti || !this.formPrenotazione.data || !this.formPrenotazione.ora) {
        this.errorMessage = 'Compila tutti i campi obbligatori.';
        return;
      }

      try {
        const response = await axios.post('/api/ristorante/creaPrenotazioni', {
          username: this.username,
          data: this.formPrenotazione.data,
          ora: this.formPrenotazione.ora,
          ospiti: this.formPrenotazione.ospiti
        });

        if (response.data.success) {
          const dataFormatted = this.formatData(this.formPrenotazione.data);
          const oraFormatted = this.formatOra(this.formPrenotazione.ora);

          this.successMessage = `Prenotazione confermata! Tavolo #${response.data.idtavolo} per ${this.formPrenotazione.ospiti} ${this.formPrenotazione.ospiti === 1 ? 'persona' : 'persone'} il ${dataFormatted} alle ${oraFormatted}.`;

          this.formPrenotazione = { ospiti: null, data: '', ora: '' };
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => { this.successMessage = ''; }, 6000);
        }
      } catch (err: any) {
        console.error('Errore creazione prenotazione:', err);
        this.errorMessage = err.response?.data?.message || 'Errore durante la prenotazione. Riprova più tardi.';
      }
    },

    formatData(data: string) {
      if (!data) return '';
      return new Date(data).toLocaleDateString('it-IT');
    },

    formatOra(ora: string) {
      if (!ora) return '';
      return ora.substring(0, 5);
    }
  }
});
</script>
