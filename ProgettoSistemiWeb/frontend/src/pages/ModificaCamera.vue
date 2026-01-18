<script lang="ts">
  import { defineComponent } from "vue";
  import axios from "axios";
  
  export default defineComponent({
    name: "ModificaCamera",
    props: ['idcamera'], 
    data() {
      return {
        camera: null as any,
        caricamento: true
      };
    },
    methods: {
      caricaDati() {
        axios.get("/api/camere").then(res => {
          const trovata = res.data.find((c: any) => c.idcamera == this.idcamera);
          if (trovata) {
            this.camera = trovata;
          }
          this.caricamento = false;
        }).catch(err => {
          console.error("Errore caricamento:", err);
          this.caricamento = false;
        });
      },

      salvaModifiche() {
        axios.put(`/api/aggiornaCamera/${this.idcamera}`, this.camera)
          .then(() => {
            alert("Camera aggiornata!");
            this.$router.push('/camere');
          })
          .catch(err => {
            console.error("Errore nel salvataggio:", err);
          });
      }
    },
    mounted() {
      this.caricaDati();
    }
  });
  </script>
  
  <template>
    <div class="edit-container">
      <div v-if="caricamento">Caricamento in corso...</div>
      <div v-else-if="camera">
        <h2>Modifica Camera ID: {{ idcamera }}</h2>
        <div class="form">
          <label>Nome:</label>
          <input v-model="camera.nomecamera" type="text" />
          <label>Descrizione:</label>
          <textarea v-model="camera.descrizionecamera"></textarea>
          <label>Prezzo (€):</label>
          <input v-model="camera.prezzocamera" type="number" />
          <button @click="salvaModifiche" class="btn-save">Salva Modifiche</button>
        </div>
      </div>
      <div v-else>
        <p>Errore: Camera non trovata.</p>
        <router-link to="/camere">Torna alla lista</router-link>
      </div>
    </div>
  </template>