<template>
  <div id="app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-brand">
          <i class="pi pi-chart-line brand-icon"></i>
          <h1 class="brand-title">ML Experiment Log Viewer</h1>
        </div>
        
        <div class="header-actions">
          <Button
            v-if="totalDataPoints > 0"
            :label="`${experiments.length} experiments • ${totalDataPoints.toLocaleString()} data points`"
            icon="pi pi-info-circle"
            text
            size="small"
            disabled
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- File Upload Section -->
        <FileUpload />

        <!-- Experiments and Metrics Selection -->
        <div v-if="experiments.length > 0" class="selection-section">
          <div class="grid">
            <div class="col-12 lg:col-6">
              <ExperimentList />
            </div>
            <div class="col-12 lg:col-6">
              <MetricSelector />
            </div>
          </div>
        </div>

        <!-- Chart Display -->
        <ChartDisplay />

        <!-- Empty State -->
        <Card v-if="experiments.length === 0" class="empty-state">
          <template #content>
            <div class="text-center py-8">
              <i class="pi pi-upload empty-icon text-6xl mb-4"></i>
              <h2 class="empty-title mb-3">Welcome to ML Experiment Log Viewer</h2>
              <p class="empty-description mb-4">
                Upload your CSV experiment logs to visualize and compare machine learning metrics across training runs.
              </p>
              <div class="empty-features">
                <div class="feature-grid">
                  <div class="feature-item">
                    <i class="pi pi-file text-primary"></i>
                    <span>CSV Upload</span>
                  </div>
                  <div class="feature-item">
                    <i class="pi pi-chart-line text-primary"></i>
                    <span>Interactive Charts</span>
                  </div>
                  <div class="feature-item">
                    <i class="pi pi-filter text-primary"></i>
                    <span>Filtering & Selection</span>
                  </div>
                  <div class="feature-item">
                    <i class="pi pi-download text-primary"></i>
                    <span>Data Export</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p class="footer-text">
          ML Experiment Log Viewer • Built with Vue 3, PrimeVue & Chart.js
        </p>
      </div>
    </footer>

    <!-- Toast Container -->
    <Toast position="top-right" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import FileUpload from './components/FileUpload.vue'
import ExperimentList from './components/ExperimentList.vue'
import MetricSelector from './components/MetricSelector.vue'
import ChartDisplay from './components/ChartDisplay.vue'
import { useExperimentStore } from './store/experimentStore'

const experimentStore = useExperimentStore()

const experiments = computed(() => experimentStore.experiments)
const totalDataPoints = computed(() => experimentStore.totalDataPoints)

onMounted(() => {
  // Load saved session state if available
  experimentStore.loadSessionState()
  
  // Save session state when page unloads
  window.addEventListener('beforeunload', () => {
    experimentStore.saveSessionState()
  })
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.app-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  font-size: 1.8rem;
  color: #3B82F6;
}

.brand-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.selection-section {
  margin-bottom: 2rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.empty-state {
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border: 2px dashed var(--p-surface-border);
}

.empty-icon {
  color: var(--p-primary-200);
}

.empty-title {
  color: var(--p-text-color);
  font-weight: 600;
  font-size: 1.5rem;
}

.empty-description {
  color: var(--p-text-muted-color);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-border);
  transition: all 0.2s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-item i {
  font-size: 1.5rem;
}

.feature-item span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-color);
}

.app-footer {
  background: var(--p-surface-100);
  border-top: 1px solid var(--p-surface-border);
  padding: 1.5rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
}

.footer-text {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    text-align: center;
  }
  
  .brand-title {
    font-size: 1.25rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .main-content {
    padding: 1rem 0;
  }
  
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .feature-item {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .header-brand {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .brand-title {
    font-size: 1.1rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>