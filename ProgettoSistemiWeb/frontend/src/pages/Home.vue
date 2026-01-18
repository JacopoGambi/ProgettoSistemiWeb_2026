<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "Home",
  data() {
    return {
      recensioni: [] as any[],
      nuovaRecensione: { testo: "", voto: 5 },
      username: localStorage.getItem('username') || null,
      tipo: localStorage.getItem('tipo') || null
    };
  },
  methods: {
    checkLogin() {
      this.username = localStorage.getItem('username');
      this.tipo = localStorage.getItem('tipo');
    },
    getRecensioni() {
      axios.get("/api/mostraRecensioni")
        .then(res => {
          this.recensioni = res.data;
        })
        .catch(err => console.error("Errore caricamento recensioni:", err));
    },
    inviaRecensione() {
      if (!this.nuovaRecensione.testo.trim() || !this.username) return;

      const dati = {
        username: this.username,
        testo: this.nuovaRecensione.testo,
        voto: this.nuovaRecensione.voto
      };

      axios.post("/api/creaRecensioni", dati)
        .then(() => {
          this.nuovaRecensione.testo = "";
          this.getRecensioni();
          alert("Grazie! La tua recensione è stata pubblicata.");
        })
        .catch(err => console.error("Errore nell'invio della recensione:", err));
    }
  },
  mounted() {
    this.checkLogin();
    this.getRecensioni();
  }
});
</script>

<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>Benvenuti al Grand Hotel Mattei</h1>
        <p class="hero-subtitle">Da generazioni, un'accoglienza di tradizione ed eleganza sulla Riviera Romagnola</p>
        <div class="hero-cta">
          <router-link to="/camere" class="btn-hero-primary">Scopri le Camere</router-link>
          <router-link to="/ristorante" class="btn-hero-secondary">Prenota un Tavolo</router-link>
        </div>
      </div>
    </section>

    <section class="services-section">
      <div class="section-header">
        <h2>I Nostri Servizi</h2>
        <p>Tutto quello che serve per una vacanza indimenticabile</p>
      </div>

      <div class="services-grid">
        <router-link to="/camere" class="service-card">
          <div class="service-icon">
            <i class="bi bi-house-door"></i>
          </div>
          <h3>Camere Eleganti</h3>
          <p>Comfort e stile per il tuo soggiorno. Singole, doppie e suite con vista mare.</p>
        </router-link>

        <router-link to="/spiaggia" class="service-card">
          <div class="service-icon">
            <i class="bi bi-umbrella"></i>
          </div>
          <h3>Spiaggia Privata</h3>
          <p>Sabbia dorata e mare cristallino. Ombrelloni e lettini riservati ai nostri ospiti.</p>
        </router-link>

        <router-link to="/ristorante" class="service-card">
          <div class="service-icon">
            <i class="bi bi-cup-hot"></i>
          </div>
          <h3>Ristorante</h3>
          <p>Cucina romagnola tradizionale. Cappelletti, piadine e pesce fresco ogni giorno.</p>
        </router-link>
      </div>
    </section>

    <!-- Carosello -->
   <section class="gallery-section">
      <div class="section-header">
        <h2>La Nostra Struttura</h2>
        <p>Scopri gli ambienti del Grand Hotel Mattei</p>
      </div>

      <div id="hotelCarousel" class="carousel slide shadow-lg rounded-4" data-bs-ride="carousel" data-bs-interval="4000">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#hotelCarousel" data-bs-slide-to="0" class="active"></button>
          <button type="button" data-bs-target="#hotelCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#hotelCarousel" data-bs-slide-to="2"></button>
          <button type="button" data-bs-target="#hotelCarousel" data-bs-slide-to="3"></button>
          <button type="button" data-bs-target="#hotelCarousel" data-bs-slide-to="4"></button>
        </div>

        <div class="carousel-inner rounded-4">
          <div class="carousel-item active">
            <img src="/immagini/hotel.jpg" class="d-block w-100 carousel-img" alt="Hotel">
            <div class="carousel-caption d-none d-md-block">
              <h5>Il Nostro Hotel</h5>
            </div>
          </div>
          <div class="carousel-item">
            <img src="/immagini/suite.jpg" class="d-block w-100 carousel-img" alt="Suite">
            <div class="carousel-caption d-none d-md-block">
              <h5>Suite Panoramica</h5>
            </div>
          </div>
          <div class="carousel-item">
            <img src="/immagini/fotoRistorante.png" class="d-block w-100 carousel-img" alt="Ristorante">
            <div class="carousel-caption d-none d-md-block">
              <h5>Il Nostro Ristorante</h5>
            </div>
          </div>
          <div class="carousel-item">
            <img src="/immagini/fotoSpiaggia.png" class="d-block w-100 carousel-img" alt="Spiaggia">
            <div class="carousel-caption d-none d-md-block">
              <h5>Spiaggia Privata</h5>
            </div>
          </div>
          <div class="carousel-item">
            <img src="/immagini/doppia.jpg" class="d-block w-100 carousel-img" alt="Camera Doppia">
            <div class="carousel-caption d-none d-md-block">
              <h5>Camera Doppia</h5>
            </div>
          </div>
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#hotelCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#hotelCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
    </section>

    <section class="reviews-section">
      <div class="section-header">
        <h2>Dicono di Noi</h2>
        <p>Le opinioni dei nostri ospiti</p>
      </div>

      <div v-if="recensioni.length > 0" class="reviews-grid">
        <div v-for="r in recensioni" :key="r.idRecensione" class="review-card">
          <div class="review-header">
            <div class="reviewer-avatar">{{ r.username.charAt(0).toUpperCase() }}</div>
            <div class="reviewer-info">
              <p class="reviewer-name">{{ r.username }}</p>
              <p class="reviewer-stars">
                {{ "\u2605".repeat(r.voto) }}{{ "\u2606".repeat(5 - r.voto) }}
              </p>
            </div>
          </div>
          <p class="reviewer-text">"{{ r.testo }}"</p>
        </div>
      </div>
      <div v-else class="no-reviews-card">
        <i class="bi bi-chat-square-text"></i>
        <p>Non ci sono ancora recensioni. Sii il primo a lasciarne una!</p>
      </div>

      <div v-if="username && tipo === 'cliente'" class="write-review-card">
        <h4><i class="bi bi-pencil-square"></i> Lascia la tua recensione</h4>
        <textarea v-model="nuovaRecensione.testo" placeholder="Raccontaci la tua esperienza al Grand Hotel Mattei..."></textarea>
        <div class="review-form-footer">
          <div class="rating-select">
            <label>Valutazione:</label>
            <select v-model="nuovaRecensione.voto">
              <option v-for="n in 5" :key="n" :value="n">{{ n }} {{ n === 1 ? 'Stella' : 'Stelle' }}</option>
            </select>
          </div>
          <button @click="inviaRecensione" class="btn-submit-review">
            <i class="bi bi-send"></i> Invia Recensione
          </button>
        </div>
      </div>

      <div v-else class="review-notice-card">
        <p v-if="tipo === 'dipendente'">
          <i class="bi bi-info-circle"></i> Sei loggato come staff: non puoi inserire recensioni.
        </p>
        <p v-else>
          <i class="bi bi-person"></i> Vuoi condividere la tua esperienza?
          <router-link to="/scelta-accesso">Accedi come cliente</router-link>
        </p>
      </div>
    </section>
  </div>
</template>
