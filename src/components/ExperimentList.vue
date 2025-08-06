<template>
  <Card class="mb-6">
    <template #title>
      <div class="flex align-items-center justify-content-between">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-list text-primary"></i>
          <span>Experiments</span>
          <Badge :value="experiments.length" severity="info" />
        </div>

        <div class="flex gap-2">
          <Button
            v-if="selectedExperimentIds.size > 0"
            label="Clear Selection"
            icon="pi pi-times"
            outlined
            severity="secondary"
            size="small"
            @click="clearSelection"
          />
          <Button
            v-if="
              experiments.length > 0 &&
              selectedExperimentIds.size < experiments.length
            "
            label="Select All"
            icon="pi pi-check"
            outlined
            size="small"
            @click="selectAll"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div v-if="experiments.length === 0" class="text-center py-6">
        <i class="pi pi-inbox text-400 text-6xl mb-3"></i>
        <p class="text-600 mb-0">
          No experiments loaded. Please upload a CSV file first.
        </p>
      </div>

      <div v-else>
        <!-- Selection Summary -->
        <div v-if="selectedExperimentIds.size > 0" class="mb-4">
          <Message severity="info" :closable="false">
            <div class="flex align-items-center justify-content-between">
              <span>
                <strong>{{ selectedExperimentIds.size }}</strong> experiment{{
                  selectedExperimentIds.size !== 1 ? "s" : ""
                }}
                selected ({{ totalSelectedDataPoints }} data points)
              </span>
            </div>
          </Message>
        </div>

        <!-- Search/Filter -->
        <div class="mb-4">
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
              <i class="pi pi-search"></i>
            </span>
            <InputText
              v-model="searchTerm"
              placeholder="Search experiments by ID..."
              class="w-full"
            />
          </div>
        </div>

        <!-- Experiments Grid -->
        <div class="experiments-grid">
          <div
            v-for="experiment in filteredExperiments"
            :key="experiment.id"
            class="experiment-card"
            :class="{
              'experiment-card-selected': selectedExperimentIds.has(
                experiment.id
              ),
            }"
            @click="toggleExperiment(experiment.id)"
          >
            <!-- Selection Checkbox -->
            <div class="experiment-header">
              <Checkbox
                :model-value="selectedExperimentIds.has(experiment.id)"
                binary
                @click.stop
                @change="toggleExperiment(experiment.id)"
              />
              <div class="experiment-title">
                <h4 class="mb-1">{{ experiment.id }}</h4>
                <p class="text-sm text-600 mb-0">
                  {{ experiment.data.length }} data points
                </p>
              </div>
            </div>

            <!-- Metrics -->
            <div class="experiment-metrics">
              <div class="metrics-header mb-2">
                <span class="text-sm font-semibold text-700"
                  >Metrics ({{ experiment.metrics.size }})</span
                >
              </div>
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="metric in Array.from(experiment.metrics).slice(0, 6)"
                  :key="metric"
                  :value="metric"
                  severity="secondary"
                  class="metric-tag"
                />
                <Tag
                  v-if="experiment.metrics.size > 6"
                  :value="`+${experiment.metrics.size - 6} more`"
                  severity="info"
                  class="metric-tag"
                />
              </div>
            </div>

            <!-- Stats -->
            <div class="experiment-stats">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Steps</span>
                  <span class="stat-value">{{ getStepRange(experiment) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Data Points</span>
                  <span class="stat-value">{{
                    experiment.data.length.toLocaleString()
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No results message -->
        <div v-if="filteredExperiments.length === 0" class="text-center py-4">
          <p class="text-600 mb-0">
            No experiments match your search criteria.
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Badge from "primevue/badge";
import Message from "primevue/message";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Tag from "primevue/tag";
import { useExperimentStore } from "@/store/experimentStore";
import type { ParsedExperiment } from "@/types/experiment";

const experimentStore = useExperimentStore();
const searchTerm = ref("");

const experiments = computed(() => experimentStore.experiments);
const selectedExperimentIds = computed(
  () => experimentStore.selectedExperimentIds
);

const filteredExperiments = computed(() => {
  if (!searchTerm.value) return experiments.value;

  const term = searchTerm.value.toLowerCase();
  return experiments.value.filter((exp) => exp.id.toLowerCase().includes(term));
});

const totalSelectedDataPoints = computed(() => {
  return experimentStore.selectedExperiments.reduce(
    (total, exp) => total + exp.data.length,
    0
  );
});

function toggleExperiment(experimentId: string) {
  experimentStore.toggleExperiment(experimentId);
}

function selectAll() {
  experimentStore.selectAllExperiments();
}

function clearSelection() {
  experimentStore.clearExperimentSelection();
}

function getStepRange(experiment: ParsedExperiment): string {
  if (experiment.data.length === 0) return "0";

  const steps = experiment.data.map((d) => d.step);
  const min = Math.min(...steps);
  const max = Math.max(...steps);

  return min === max ? `${min}` : `${min}-${max}`;
}
</script>

<style scoped>
.experiments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.experiment-card {
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--p-surface-0);
}

.experiment-card:hover {
  border-color: var(--p-primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.experiment-card-selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.15);
}

.experiment-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.experiment-title h4 {
  font-weight: 600;
  color: var(--p-text-color);
  font-size: 1rem;
  line-height: 1.2;
}

.experiment-metrics {
  margin-bottom: 1rem;
}

.metrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.experiment-stats {
  border-top: 1px solid var(--p-surface-border);
  padding-top: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-text-color);
}

@media (max-width: 768px) {
  .experiments-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .experiment-card {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
