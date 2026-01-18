import { createApp } from "vue";


// Bootstrap 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

// Stili custom del progetto
import "./style.css";

import App from "./App.vue";
import router from "./router";

createApp(App).use(router).mount("#app");
