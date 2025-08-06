<template>
  <Card v-if="selectedExperimentIds.size > 0" class="mb-6">
    <template #title>
      <div class="flex align-items-center justify-content-between">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-chart-line text-primary"></i>
          <span>Metrics</span>
          <Badge :value="availableMetrics.length" severity="info" />
        </div>

        <div class="flex gap-2">
          <Button
            v-if="selectedMetrics.size > 0"
            label="Clear Selection"
            icon="pi pi-times"
            outlined
            severity="secondary"
            size="small"
            @click="clearSelection"
          />
          <Button
            v-if="
              availableMetrics.length > 0 &&
              selectedMetrics.size < availableMetrics.length
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
      <div v-if="availableMetrics.length === 0" class="text-center py-4">
        <i class="pi pi-chart-bar text-400 text-4xl mb-3"></i>
        <p class="text-600 mb-0">
          No metrics available for selected experiments.
        </p>
      </div>

      <div v-else>
        <!-- Selection Summary -->
        <div v-if="selectedMetrics.size > 0" class="mb-4">
          <Message severity="success" :closable="false">
            <div class="flex align-items-center justify-content-between">
              <span>
                <strong>{{ selectedMetrics.size }}</strong> metric{{
                  selectedMetrics.size !== 1 ? "s" : ""
                }}
                selected for visualization
              </span>
              <Button
                label="Export Data"
                icon="pi pi-download"
                text
                size="small"
                @click="exportData"
                :disabled="selectedMetrics.size === 0"
              />
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
              :model-value="metricFilter"
              @update:model-value="setFilter"
              placeholder="Search metrics by name..."
              class="w-full"
            />
            <Button
              v-if="metricFilter"
              icon="pi pi-times"
              outlined
              @click="clearFilter"
            />
          </div>
        </div>

        <!-- Metrics List -->
        <div class="metrics-container">
          <div
            v-for="metric in filteredMetrics"
            :key="metric"
            class="metric-item"
            :class="{ 'metric-selected': selectedMetrics.has(metric) }"
            @click="toggleMetric(metric)"
          >
            <div class="metric-content">
              <Checkbox
                :model-value="selectedMetrics.has(metric)"
                binary
                @click.stop
                @change="toggleMetric(metric)"
              />
              <div class="metric-info">
                <h5 class="metric-name">{{ metric }}</h5>
                <p class="metric-stats">
                  Available in
                  {{ getMetricExperimentCount(metric) }} experiment{{
                    getMetricExperimentCount(metric) !== 1 ? "s" : ""
                  }}
                  • {{ getMetricDataPointCount(metric) }} data points
                </p>
              </div>
            </div>

            <!-- Metric Preview -->
            <div v-if="selectedMetrics.has(metric)" class="metric-preview">
              <div class="preview-stats">
                <div class="stat-item">
                  <span class="stat-label">Min</span>
                  <span class="stat-value">{{
                    getMetricStats(metric).min
                  }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Max</span>
                  <span class="stat-value">{{
                    getMetricStats(metric).max
                  }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Avg</span>
                  <span class="stat-value">{{
                    getMetricStats(metric).avg
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No results message -->
        <div v-if="filteredMetrics.length === 0" class="text-center py-4">
          <p class="text-600 mb-0">No metrics match your search criteria.</p>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useToast } from "primevue/usetoast";
import Card from "primevue/card";
import Button from "primevue/button";
import Badge from "primevue/badge";
import Message from "primevue/message";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import { useExperimentStore } from "@/store/experimentStore";

const toast = useToast();
const experimentStore = useExperimentStore();

const selectedExperimentIds = computed(
  () => experimentStore.selectedExperimentIds
);
const selectedMetrics = computed(() => experimentStore.selectedMetrics);
const availableMetrics = computed(
  () => experimentStore.availableMetricsForSelection
);
const filteredMetrics = computed(() => experimentStore.filteredMetrics);
const metricFilter = computed(() => experimentStore.metricFilter);

function toggleMetric(metricName: string) {
  experimentStore.toggleMetric(metricName);
}

function selectAll() {
  experimentStore.selectAllMetrics();
}

function clearSelection() {
  experimentStore.clearMetricSelection();
}

function setFilter(value: string | undefined) {
  experimentStore.setMetricFilter(value ?? "");
}

function clearFilter() {
  experimentStore.setMetricFilter("");
}

function exportData() {
  const success = experimentStore.exportSelectedData();

  if (success) {
    toast.add({
      severity: "success",
      summary: "Data Exported",
      detail: "CSV file has been downloaded",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "warn",
      summary: "No Data to Export",
      detail: "Please select experiments and metrics first",
      life: 3000,
    });
  }
}

function getMetricExperimentCount(metricName: string): number {
  return experimentStore.selectedExperiments.filter((exp) =>
    exp.metrics.has(metricName)
  ).length;
}

function getMetricDataPointCount(metricName: string): number {
  return experimentStore.selectedExperiments.reduce((total, exp) => {
    return total + exp.data.filter((d) => d.metric_name === metricName).length;
  }, 0);
}

function getMetricStats(metricName: string): {
  min: string;
  max: string;
  avg: string;
} {
  const values: number[] = [];

  experimentStore.selectedExperiments.forEach((exp) => {
    exp.data
      .filter((d) => d.metric_name === metricName)
      .forEach((d) => values.push(d.value));
  });

  if (values.length === 0) {
    return { min: "N/A", max: "N/A", avg: "N/A" };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  return {
    min: min.toFixed(4),
    max: max.toFixed(4),
    avg: avg.toFixed(4),
  };
}
</script>

<style scoped>
.metrics-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-item {
  border: 1px solid var(--p-surface-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--p-surface-0);
}

.metric-item:hover {
  border-color: var(--p-primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metric-selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.15);
}

.metric-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.metric-info {
  flex: 1;
}

.metric-name {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: var(--p-text-color);
  font-size: 1rem;
}

.metric-stats {
  margin: 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.metric-preview {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-border);
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  font-family: monospace;
}

@media (max-width: 768px) {
  .metric-content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
}
</style>
