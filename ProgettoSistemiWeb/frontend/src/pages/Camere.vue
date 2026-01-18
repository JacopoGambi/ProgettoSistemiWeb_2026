<template>
  <div class="camere-page">
    <section class="camere-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1><i class="bi bi-house-door"></i> Le Nostre Camere</h1>
        <p>Comfort e eleganza per il tuo soggiorno sulla Riviera Romagnola</p>
      </div>
    </section>

    <div class="camere-container">
      <section class="amenities-section">
        <div class="amenities-title">
          <h2>Tutti i comfort inclusi</h2>
          <p>Ogni camera è dotata dei migliori servizi per il tuo relax</p>
        </div>
        <div class="amenities-grid">
          <div class="amenity-item">
            <i class="bi bi-wifi"></i>
            <span>Wi-Fi Gratuito</span>
          </div>
          <div class="amenity-item">
            <i class="bi bi-snow"></i>
            <span>Aria Condizionata</span>
          </div>
          <div class="amenity-item">
            <i class="bi bi-tv"></i>
            <span>TV Satellitare</span>
          </div>
          <div class="amenity-item">
            <i class="bi bi-safe"></i>
            <span>Cassaforte</span>
          </div>
        </div>
      </section>

      <section class="rooms-section">
        <div class="section-header">
          <h2>Scegli la tua camera ideale</h2>
          <p>Tutte le nostre camere sono dotate dei migliori comfort</p>
        </div>

        <div class="rooms-horizontal">
          <div v-for="camera in camere" :key="camera.idcamera" class="room-card-horizontal">
            <div class="room-image">
              <img :src="`/immagini/${camera.imgcamera}`" :alt="camera.nomecamera">
              <div class="room-badge">
                <span class="price-tag">{{ camera.prezzocamera }}€<small>/notte</small></span>
              </div>
            </div>

            <div class="room-content">
              <h3>{{ camera.nomecamera }}</h3>
              <p class="room-description">{{ camera.descrizionecamera }}</p>

              <div class="room-features">
                <span><i class="bi bi-person"></i> Max 2 ospiti</span>
                <span><i class="bi bi-rulers"></i> 25 mq</span>
              </div>

              <router-link
                v-if="tipoUtente === 'cliente'"
                :to="'/prenota/' + camera.idcamera"
                class="btn-room-action primary"
              >
                <i class="bi bi-calendar-check"></i> Prenota ora
              </router-link>

              <router-link
                v-else-if="tipoUtente === 'dipendente'"
                :to="'/modifica-camera/' + camera.idcamera"
                class="btn-room-action edit"
              >
                <i class="bi bi-pencil"></i> Modifica Camera
              </router-link>

              <router-link
                v-else
                to="/scelta-accesso"
                class="btn-room-action login"
              >
                <i class="bi bi-box-arrow-in-right"></i> Accedi per prenotare
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: "Camere",
  data() {
    return {
      camere: [] as any[],
      tipoUtente: localStorage.getItem('tipo')
    };
  },
  methods: {
    async caricaCamere() {
      try {
        const res = await axios.get('/api/camere');
        this.camere = res.data;
      } catch (err) {
        console.error("Errore nel caricamento delle camere:", err);
      }
    }
  },
  mounted() {
    this.caricaCamere();
  }
});
</script>
