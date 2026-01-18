import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/Home.vue";
import Camere from "../pages/Camere.vue";
import Spiaggia from "../pages/Spiaggia.vue";
import Login from "../pages/Login.vue";
import Contatti from "../pages/Contatti.vue";
import NotFound from "../pages/NotFound.vue";
import SceltaAccesso from "../pages/SceltaAccesso.vue";
import ModificaCamera from "../pages/ModificaCamera.vue";
import Prenotazioni from "../pages/Prenotazioni.vue";
import Prenota from "../pages/PrenotazioniCamera.vue";
import Menu from "../pages/Menu.vue";
import Ristorante from "../pages/Ristorante.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },

    { path: "/camere", component: Camere },

    { path: "/hotel", redirect: "/camere" },

    { path: "/spiaggia", component: Spiaggia },
    { path: "/scelta-accesso", component: SceltaAccesso },

    { path: "/login/:tipo", name: "login", component: Login, props: true },
    { path: "/login", redirect: "/scelta-accesso" },

    {
      path: "/prenota/:idcamera",
      name: "Prenota",
      component: Prenota,
      props: true,
    },

    { path: "/modifica-camera/:idcamera", name: "ModificaCamera", component: ModificaCamera, props: true },
    { path: "/prenotazioni", name: "Prenotazioni", component: Prenotazioni },
    { path: "/contatti", component: Contatti },

    { path: "/menu", name: "Menu", component: Menu },
    { path: "/ristorante", name: "Ristorante", component: Ristorante },

    { path: "/:pathMatch(.*)*", component: NotFound },
  ],
});
