<template>
  <Card v-if="chartData.length > 0" class="chart-card">
    <template #title>
      <div class="flex align-items-center justify-content-between flex-wrap gap-3">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-chart-line text-primary"></i>
          <span>Metric Visualization</span>
          <Badge :value="`${chartData.length} series`" severity="info" />
        </div>
        
        <div class="flex gap-2 flex-wrap">
          <SelectButton
            v-model="chartType"
            :options="chartTypeOptions"
            option-label="label"
            option-value="value"
            size="small"
          />
          <Button
            label="Reset Zoom"
            icon="pi pi-refresh"
            outlined
            size="small"
            @click="resetZoom"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="chart-container">
        <!-- Chart Controls -->
        <div class="chart-controls mb-4">
          <div class="flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="flex align-items-center gap-3">
              <div class="chart-control">
                <label class="control-label">Show Legend</label>
                <ToggleButton
                  v-model="showLegend"
                  on-label="Yes"
                  off-label="No"
                  size="small"
                />
              </div>
              
              <div class="chart-control">
                <label class="control-label">Grid</label>
                <ToggleButton
                  v-model="showGrid"
                  on-label="On"
                  off-label="Off"
                  size="small"
                />
              </div>

              <div class="chart-control">
                <label class="control-label">Points</label>
                <ToggleButton
                  v-model="showPoints"
                  on-label="Show"
                  off-label="Hide"
                  size="small"
                />
              </div>
            </div>

            <div class="chart-info text-sm text-600">
              Total data points: {{ totalDataPoints.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Chart Area -->
        <div class="chart-wrapper" :style="{ height: chartHeight + 'px' }">
          <Line
            ref="chartRef"
            :data="formattedChartData"
            :options="chartOptions"
            class="chart-canvas"
          />
        </div>

        <!-- Legend (Custom) -->
        <div v-if="showLegend && chartData.length > 1" class="chart-legend mt-4">
          <h4 class="legend-title">Series Legend</h4>
          <div class="legend-items">
            <div
              v-for="(series, index) in chartData"
              :key="`${series.experimentId}-${series.metricName}`"
              class="legend-item"
              @click="toggleSeries(index)"
            >
              <div 
                class="legend-color"
                :style="{ backgroundColor: getSeriesColor(index) }"
              ></div>
              <span class="legend-text">
                {{ series.experimentId }} - {{ series.metricName }}
                <Badge 
                  :value="`${series.data.length} pts`" 
                  severity="secondary" 
                  class="ml-2"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import SelectButton from 'primevue/selectbutton'
import ToggleButton from 'primevue/togglebutton'
import { useExperimentStore } from '@/store/experimentStore'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
)

const experimentStore = useExperimentStore()
const chartRef = ref()

// Chart configuration
const chartType = ref('line')
const showLegend = ref(true)
const showGrid = ref(true)
const showPoints = ref(false)
const chartHeight = ref(400)

const chartTypeOptions = [
  { label: 'Line', value: 'line' },
  { label: 'Area', value: 'area' }
]

// Data
const chartData = computed(() => experimentStore.chartData)

// Color palette for different series
const colorPalette = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

const totalDataPoints = computed(() => {
  return chartData.value.reduce((total, series) => total + series.data.length, 0)
})

const formattedChartData = computed((): ChartData<'line'> => {
  const datasets = chartData.value.map((series, index) => {
    const color = getSeriesColor(index)
    const isArea = chartType.value === 'area'
    
    return {
      label: `${series.experimentId} - ${series.metricName}`,
      data: series.data.map(point => ({
        x: point.step,
        y: point.value
      })),
      borderColor: color,
      backgroundColor: isArea ? `${color}20` : color,
      fill: isArea,
      tension: 0.1,
      pointRadius: showPoints.value ? 3 : 0,
      pointHoverRadius: 5,
      pointBackgroundColor: color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 1,
      borderWidth: 2,
      spanGaps: true
    }
  })

  return { datasets }
})

const chartOptions = computed((): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300,
    easing: 'easeInOutQuart'
  },
  interaction: {
    mode: 'point',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false // Using custom legend
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#3B82F6',
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      callbacks: {
        title: (context) => {
          return `Step: ${context[0].parsed.x}`
        },
        label: (context) => {
          const value = context.parsed.y
          return `${context.dataset.label}: ${typeof value === 'number' ? value.toFixed(6) : value}`
        }
      }
    },
    zoom: {
      zoom: {
        wheel: {
          enabled: true,
          modifierKey: 'ctrl'
        },
        pinch: {
          enabled: true
        },
        mode: 'xy',
        onZoomComplete: ({ chart }) => {
          // Optional: Add zoom completion callback
        }
      },
      pan: {
        enabled: true,
        mode: 'xy',
        modifierKey: 'shift'
      }
    }
  },
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: 'Training Step',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      grid: {
        display: showGrid.value,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        maxTicksLimit: 10
      }
    },
    y: {
      title: {
        display: true,
        text: 'Metric Value',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      grid: {
        display: showGrid.value,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        callback: function(value) {
          return typeof value === 'number' ? value.toFixed(4) : value
        }
      }
    }
  }
}))

function getSeriesColor(index: number): string {
  return colorPalette[index % colorPalette.length]
}

function resetZoom() {
  if (chartRef.value?.chart) {
    chartRef.value.chart.resetZoom()
  }
}

function toggleSeries(seriesIndex: number) {
  if (chartRef.value?.chart) {
    const chart = chartRef.value.chart
    const meta = chart.getDatasetMeta(seriesIndex)
    meta.hidden = !meta.hidden
    chart.update()
  }
}

// Responsive chart height
function updateChartHeight() {
  const width = window.innerWidth
  if (width < 768) {
    chartHeight.value = 300
  } else if (width < 1024) {
    chartHeight.value = 350
  } else {
    chartHeight.value = 400
  }
}

onMounted(() => {
  updateChartHeight()
  window.addEventListener('resize', updateChartHeight)
})

// Watch for data changes to ensure chart updates
watch(chartData, () => {
  if (chartRef.value?.chart) {
    chartRef.value.chart.update()
  }
}, { deep: true })
</script>

<style scoped>
.chart-card {
  min-height: 500px;
}

.chart-container {
  width: 100%;
}

.chart-controls {
  padding: 1rem;
  background: var(--p-surface-50);
  border-radius: 6px;
  border: 1px solid var(--p-surface-border);
}

.chart-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  font-weight: 500;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  border: 1px solid var(--p-surface-border);
  border-radius: 6px;
  padding: 1rem;
  background: var(--p-surface-0);
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart-legend {
  padding: 1rem;
  background: var(--p-surface-50);
  border-radius: 6px;
  border: 1px solid var(--p-surface-border);
}

.legend-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.legend-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.legend-item:hover {
  background: var(--p-surface-100);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 0.875rem;
  color: var(--p-text-color);
  display: flex;
  align-items: center;
}

.chart-info {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .chart-controls .flex {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .chart-controls .flex:first-child {
    flex-direction: row;
    justify-content: space-around;
  }
  
  .legend-items {
    grid-template-columns: 1fr;
  }
  
  .chart-info {
    text-align: center;
  }
}
</style>