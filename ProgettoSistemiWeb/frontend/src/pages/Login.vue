<template>
  <div class="login-page">
    <section class="login-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1><i class="bi bi-person-circle"></i> {{ isRegistering ? 'Registrazione' : 'Accesso' }}</h1>
        <p>{{ tipo === 'dipendente' ? 'Area riservata al personale' : 'Accedi ai servizi del Grand Hotel Mattei' }}</p>
      </div>
    </section>

    <div class="login-container">
      <div v-if="isLoggedIn" class="logged-in-card">
        <div class="status-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <h2>Sessione Attiva</h2>
        <p>Sei attualmente loggato come <strong>{{ currentUser }}</strong></p>
        <p class="role-badge">{{ currentRole === 'dipendente' ? 'Staff' : 'Cliente' }}</p>

        <div class="action-buttons">
          <button @click="logout" class="btn-logout-main">
            <i class="bi bi-box-arrow-right"></i> Effettua Logout
          </button>
          <router-link to="/" class="btn-return">
            <i class="bi bi-house"></i> Torna alla Home
          </router-link>
        </div>
      </div>

      <div v-else class="login-card">
        <div class="card-header">
          <div class="header-icon">
            <i :class="tipo === 'dipendente' ? 'bi bi-briefcase' : 'bi bi-person'"></i>
          </div>
          <h2>{{ isRegistering ? 'Crea il tuo account' : (tipo === 'dipendente' ? 'Accesso Staff' : 'Accesso Clienti') }}</h2>
          <p>{{ isRegistering ? 'Inserisci i tuoi dati per registrarti' : 'Inserisci le tue credenziali' }}</p>
        </div>

        <form @submit.prevent="isRegistering ? handleRegister() : handleLogin()" class="login-form">
          <div class="form-group">
            <label for="username">
              <i class="bi bi-person"></i> Username
            </label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="Inserisci il tuo username"
              autocomplete="username"
            >
          </div>

          <div class="form-group">
            <label for="password">
              <i class="bi bi-lock"></i> Password
            </label>
            <div class="password-input">
              <input
                id="password"
                v-model="loginForm.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="Inserisci la tua password"
                autocomplete="current-password"
              >
              <button type="button" class="toggle-password" @click="isPasswordVisible = !isPasswordVisible">
                <i :class="isPasswordVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="isRegistering" class="form-group">
            <label for="confirmPassword">
              <i class="bi bi-lock-fill"></i> Conferma Password
            </label>
            <div class="password-input">
              <input
                id="confirmPassword"
                v-model="loginForm.confirmPassword"
                :type="isPasswordVisible ? 'text' : 'password'"
                placeholder="Conferma la tua password"
                autocomplete="new-password"
              >
            </div>
          </div>

          <button type="submit" class="btn-submit">
            <i :class="isRegistering ? 'bi bi-person-plus' : 'bi bi-box-arrow-in-right'"></i>
            {{ isRegistering ? 'Registrati' : 'Accedi' }}
          </button>

          <div v-if="errorMessage" class="alert alert-error">
            <i class="bi bi-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            <i class="bi bi-check-circle"></i>
            {{ successMessage }}
          </div>
        </form>
        
        <div v-if="tipo === 'cliente'" class="toggle-section">
          <p v-if="!isRegistering">
            Non hai un account?
            <a href="#" @click.prevent="toggleRegistration">Registrati qui</a>
          </p>
          <p v-else>
            Hai già un account?
            <a href="#" @click.prevent="toggleRegistration">Accedi qui</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'Login',
  props: ['tipo'],
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      errorMessage: '',
      successMessage: '',
      isLoggedIn: false,
      currentUser: '',
      currentRole: '',
      isPasswordVisible: false,
      isRegistering: false
    };
  },

  methods: {
    checkLoginStatus() {
      const savedUser = localStorage.getItem('username');
      const savedRole = localStorage.getItem('tipo');

      if (savedUser) {
        this.isLoggedIn = true;
        this.currentUser = savedUser;
        this.currentRole = savedRole || '';
      } else {
        this.isLoggedIn = false;
      }
    },

    toggleRegistration() {
      this.isRegistering = !this.isRegistering;
      this.errorMessage = '';
      this.successMessage = '';
      this.loginForm.username = '';
      this.loginForm.password = '';
      this.loginForm.confirmPassword = '';
    },

    async handleRegister() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.loginForm.username || !this.loginForm.password || !this.loginForm.confirmPassword) {
        this.errorMessage = "Inserire tutti i dati richiesti.";
        return;
      }

      if (this.loginForm.username.length < 3) {
        this.errorMessage = "L'username deve contenere almeno 3 caratteri.";
        return;
      }

      if (this.loginForm.password.length < 6) {
        this.errorMessage = "La password deve contenere almeno 6 caratteri.";
        return;
      }

      if (this.loginForm.password !== this.loginForm.confirmPassword) {
        this.errorMessage = "Le password non corrispondono.";
        return;
      }

      try {
        const response = await axios.post('/api/register', {
          username: this.loginForm.username,
          password: this.loginForm.password
        }, { withCredentials: true });

        if (response.data.message) {
          localStorage.setItem('username', this.loginForm.username);
          localStorage.setItem('tipo', 'cliente');

          this.successMessage = "Registrazione completata! Reindirizzamento...";

          setTimeout(() => {
            this.$router.push('/');
          }, 1000);
        }
      } catch (error: any) {
        console.error("Errore durante la registrazione:", error);
        if (error.response?.status === 400) {
          this.errorMessage = "Username già in uso. Scegline un altro.";
        } else if (error.response?.status === 401) {
          this.errorMessage = "Devi prima effettuare il logout.";
        } else {
          this.errorMessage = "Errore di connessione col server.";
        }
      }
    },

    async handleLogin() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.loginForm.username || !this.loginForm.password) {
        this.errorMessage = "Inserire tutti i dati richiesti.";
        return;
      }

      try {
        const response = await axios.post('/api/login', {
          username: this.loginForm.username,
          password: this.loginForm.password,
          ruolo: this.tipo
        }, { withCredentials: true });

        if (response.data.success) {
          localStorage.setItem('username', response.data.user.username);
          localStorage.setItem('tipo', response.data.user.ruolo);

          this.$router.push('/');
        } else {
          this.errorMessage = "Credenziali non valide.";
        }
      } catch (error) {
        console.error("Errore durante il login:", error);
        this.errorMessage = "Credenziali non valide o errore di connessione.";
      }
    },

    async logout() {
      try {
        await axios.post('/api/logout', {}, { withCredentials: true });
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Errore durante il logout:", error);
      } finally {
        localStorage.clear();
        this.checkLoginStatus();
        window.location.reload();
      }
    }
  },

  mounted() {
    this.checkLoginStatus();
  }
});
</script>
