<template>
  <div class="spiaggia-page">
    <section class="spiaggia-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1><i class="bi bi-umbrella"></i> La Nostra Spiaggia</h1>
        <p>Prenota il tuo ombrellone e goditi il relax sulla sabbia dorata</p>
      </div>
    </section>

    <div class="container-fluid py-4">
      <div class="row g-4">
        <aside class="col-12 col-lg-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h2 class="h5 mb-3">Scegli il periodo</h2>

              <div class="mb-3">
                <label class="form-label" for="startDate">Data inizio</label>
                <input
                  id="startDate"
                  class="form-control"
                  type="date"
                  v-model="startDate"
                  :max="endDate || undefined"
                />
              </div>

              <div class="mb-3">
                <label class="form-label" for="endDate">Data fine</label>
                <input
                  id="endDate"
                  class="form-control"
                  type="date"
                  v-model="endDate"
                  :min="startDate || undefined"
                />
              </div>

              <div class="alert alert-warning py-2 mb-3" v-if="dateError">
                {{ dateError }}
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" :disabled="!!dateError" @click="confirmRange">
                  Conferma date
                </button>
                <button class="btn btn-outline-secondary" @click="resetAll">
                  Reset
                </button>
              </div>

              <hr class="my-4" />

              <h3 class="h6 mb-2">Legenda</h3>
              <div class="legend">
                <div class="legend-item">
                  <span class="legend-swatch swatch-free"></span>
                  <span>Libero</span>
                </div>
                <div class="legend-item">
                  <span class="legend-swatch swatch-selected"></span>
                  <span>Selezionato</span>
                </div>
                <div class="legend-item">
                  <span class="legend-swatch swatch-occupied"></span>
                  <span>Occupato</span>
                </div>
              </div>

              <div class="mt-3 small text-muted">
                Seleziona un ombrellone sulla mappa a destra.
              </div>
            </div>
          </div>
        </aside>

        <!-- Mappa ombrelloni -->
        <section class="col-12 col-lg-9">
          <div class="beach-stage shadow-sm">
            <div class="beach-header">
              <div class="beach-title">
                <div class="fw-semibold">Spiaggia</div>
                <div class="text-muted small">
                  {{ confirmedRangeLabel }}
                </div>
              </div>
            </div>

            <div class="beach-viewport">
              <div class="beach-canvas">
                <div class="sea"></div>
                <div class="shore"></div>

                <!-- area sabbia con ombrelloni -->
                <div class="sand">
                <div class="lifeguard" title="Postazione bagnino"></div>
                <div class="starfish" title="Stella marina"></div>

                <div class="umbrellas">
                  <template v-for="row in rows" :key="'r'+row">
                    <div class="umbrella-row">
                      <template v-for="col in leftCols" :key="'l'+row+'-'+col">
                        <button
                          class="umbrella"
                          :class="umbrellaClass(umbrellaId(row, 'L', col))"
                          :disabled="isOccupied(umbrellaId(row, 'L', col)) || !!dateError || isStaff"
                          @click="selectUmbrella(umbrellaId(row, 'L', col))"
                          :title="umbrellaTooltip(umbrellaId(row, 'L', col))"
                        >
                          <UmbrellaIcon />
                          <span class="u-label">{{ umbrellaId(row, 'L', col) }}</span>
                        </button>
                      </template>

                      <!-- Passerella -->
                      <div class="walkway" aria-hidden="true"></div>

                      <template v-for="col in rightCols" :key="'d'+row+'-'+col">
                        <button
                          class="umbrella"
                          :class="umbrellaClass(umbrellaId(row, 'R', col))"
                          :disabled="isOccupied(umbrellaId(row, 'R', col)) || !!dateError || isStaff"
                          @click="selectUmbrella(umbrellaId(row, 'R', col))"
                          :title="umbrellaTooltip(umbrellaId(row, 'R', col))"
                        >
                          <UmbrellaIcon />
                          <span class="u-label">{{ umbrellaId(row, 'R', col) }}</span>
                        </button>
                      </template>
                    </div>
                  </template>
                </div>
                </div>
              </div>
            </div>

            <div class="beach-footer">
              <div class="small">
                <span class="text-muted">Ombrellone selezionato:</span>
                <span class="fw-semibold ms-1">{{ selectedUmbrella ?? '—' }}</span>
              </div>

              <div class="d-flex align-items-center gap-2">
                <div v-if="apiError" class="text-danger small">{{ apiError }}</div>
                <div v-else-if="apiSuccess" class="text-success small">Prenotazione registrata!</div>
                <div v-else-if="isStaff" class="text-muted small">Accesso staff: prenotazioni disabilitate.</div>
                <button class="btn btn-success" :disabled="!canProceed || isSaving" @click="proceed">
                  <span v-if="isSaving">Salvo...</span>
                  <span v-else>Procedi</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, defineComponent, h, ref } from 'vue';

const startDate = ref<string>('');
const endDate = ref<string>('');
const confirmedStart = ref<string>('');
const confirmedEnd = ref<string>('');

const selectedUmbrella = ref<string | null>(null);

const rows = 9;
const leftCols = 3;
const rightCols = 6;
const occupied = ref<Set<string>>(new Set());
const apiError = ref<string>('');
const apiSuccess = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const tipoUtente = ref<string | null>(localStorage.getItem('tipo'));
const isStaff = computed(() => tipoUtente.value === 'dipendente');

const dateError = computed(() => {
  if (!startDate.value || !endDate.value) return '';
  if (endDate.value < startDate.value) return 'La data fine non può essere precedente alla data inizio.';
  return '';
});

const confirmedRangeLabel = computed(() => {
  if (!confirmedStart.value || !confirmedEnd.value) return 'Nessun periodo confermato';
  return `Dal ${formatDate(confirmedStart.value)} al ${formatDate(confirmedEnd.value)}`;
});

const canProceed = computed(() => {
  return !!confirmedStart.value && !!confirmedEnd.value && !dateError.value && !!selectedUmbrella.value && !isStaff.value;
});

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function confirmRange() {
  confirmedStart.value = startDate.value;
  confirmedEnd.value = endDate.value;
  selectedUmbrella.value = null;
  if (confirmedStart.value && confirmedEnd.value && !dateError.value) {
    fetchOccupied();
  }
}

function resetAll() {
  startDate.value = '';
  endDate.value = '';
  confirmedStart.value = '';
  confirmedEnd.value = '';
  selectedUmbrella.value = null;
  occupied.value = new Set();
  apiError.value = '';
  apiSuccess.value = false;
}

function umbrellaId(row: number, side: 'L' | 'R', col: number) {
  return `${side}${row}-${col}`;
}

function isOccupied(id: string) {
  return occupied.value.has(id);
}

function umbrellaClass(id: string) {
  if (isOccupied(id)) return 'occupied';
  if (selectedUmbrella.value === id) return 'selected';
  return 'free';
}

function umbrellaTooltip(id: string) {
  if (isOccupied(id)) return `${id} (occupato)`;
  if (selectedUmbrella.value === id) return `${id} (selezionato)`;
  return `${id} (libero)`;
}

function selectUmbrella(id: string) {
  if (isStaff.value) return;
  if (isOccupied(id)) return;
  selectedUmbrella.value = id;
  apiError.value = '';
  apiSuccess.value = false;
}

async function fetchOccupied() {
  apiError.value = '';
  apiSuccess.value = false;
  try {
    const res = await axios.get<string[]>('/api/spiaggia/occupati', {
      params: { datainizio: confirmedStart.value, datafine: confirmedEnd.value }
    });
    occupied.value = new Set(res.data || []);
  } catch (e: any) {
    console.error(e);
    apiError.value = 'Errore nel caricamento della disponibilità.';
  }
}

async function proceed() {
  apiError.value = '';
  apiSuccess.value = false;

  if (isStaff.value) {
    apiError.value = 'Gli account staff non possono effettuare prenotazioni.';
    return;
  }

  const username = localStorage.getItem('username');
  if (!username) {
    apiError.value = 'Devi effettuare il login per prenotare.';
    return;
  }
  if (!selectedUmbrella.value) return;

  isSaving.value = true;
  try {
    await axios.post('/api/spiaggia/prenotazioni', {
      username,
      ombrellone: selectedUmbrella.value,
      datainizio: confirmedStart.value,
      datafine: confirmedEnd.value,
    });
    apiSuccess.value = true;

    occupied.value = new Set([...occupied.value, selectedUmbrella.value]);
    selectedUmbrella.value = null;
  } catch (e: any) {
    console.error(e);
    const msg = e?.response?.data?.error;
    apiError.value = msg || 'Errore durante il salvataggio della prenotazione.';
  } finally {
    isSaving.value = false;
  }
}

const UmbrellaIcon = defineComponent({
  name: 'UmbrellaIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 64 64', class: 'u-icon', 'aria-hidden': 'true' },
        [
          h('path', {
            d: 'M32 6C18 6 8 15.7 8 28h48C56 15.7 46 6 32 6Z',
            fill: 'currentColor'
          }),
          h('path', {
            d: 'M32 6v22',
            stroke: 'currentColor',
            'stroke-width': '3',
            'stroke-linecap': 'round'
          }),
          h('path', {
            d: 'M32 28v21c0 6-3 9-7 9-3 0-6-2-6-5',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '3',
            'stroke-linecap': 'round'
          })
        ]
      );
  }
});
</script>
