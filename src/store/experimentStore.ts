import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ParsedExperiment, ExperimentData, UploadStatus, MetricSeries } from '@/types/experiment'
import { parseCsv, exportToCsv } from '@/utils/csvParser'

export const useExperimentStore = defineStore('experiments', () => {
  // State
  const experiments = ref<ParsedExperiment[]>([])
  const selectedExperimentIds = ref<Set<string>>(new Set())
  const selectedMetrics = ref<Set<string>>(new Set())
  const uploadStatus = ref<UploadStatus>({
    loading: false,
    error: null,
    success: false
  })
  const metricFilter = ref<string>('')

  // Getters
  const allMetrics = computed(() => {
    const metrics = new Set<string>()
    experiments.value.forEach(exp => {
      exp.metrics.forEach(metric => metrics.add(metric))
    })
    return Array.from(metrics).sort()
  })

  const availableMetricsForSelection = computed(() => {
    if (selectedExperimentIds.value.size === 0) return []
    
    const metrics = new Set<string>()
    experiments.value
      .filter(exp => selectedExperimentIds.value.has(exp.id))
      .forEach(exp => {
        exp.metrics.forEach(metric => metrics.add(metric))
      })
    
    return Array.from(metrics).sort()
  })

  const filteredMetrics = computed(() => {
    if (!metricFilter.value) return availableMetricsForSelection.value
    
    return availableMetricsForSelection.value.filter(metric =>
      metric.toLowerCase().includes(metricFilter.value.toLowerCase())
    )
  })

  const chartData = computed(() => {
    if (selectedExperimentIds.value.size === 0 || selectedMetrics.value.size === 0) {
      return []
    }

    const series: MetricSeries[] = []

    selectedExperimentIds.value.forEach(expId => {
      const experiment = experiments.value.find(exp => exp.id === expId)
      if (!experiment) return

      selectedMetrics.value.forEach(metricName => {
        const metricData = experiment.data
          .filter(d => d.metric_name === metricName)
          .map(d => ({ step: d.step, value: d.value }))
          .sort((a, b) => a.step - b.step)

        if (metricData.length > 0) {
          series.push({
            experimentId: expId,
            metricName,
            data: metricData
          })
        }
      })
    })

    return series
  })

  const totalDataPoints = computed(() => {
    return experiments.value.reduce((total, exp) => total + exp.data.length, 0)
  })

  const selectedExperiments = computed(() => {
    return experiments.value.filter(exp => selectedExperimentIds.value.has(exp.id))
  })

  // Actions
  async function uploadCsvFile(file: File) {
    uploadStatus.value = {
      loading: true,
      error: null,
      success: false
    }

    try {
      const result = await parseCsv(file)

      if (result.success) {
        experiments.value = result.data
        uploadStatus.value = {
          loading: false,
          error: null,
          success: true
        }
        
        // Clear previous selections
        clearSelections()
        
        return {
          success: true,
          experimentsCount: result.data.length,
          totalRows: result.totalRows || 0
        }
      } else {
        uploadStatus.value = {
          loading: false,
          error: result.error || 'Unknown error occurred',
          success: false
        }
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file'
      uploadStatus.value = {
        loading: false,
        error: errorMessage,
        success: false
      }
      return { success: false, error: errorMessage }
    }
  }

  function toggleExperiment(experimentId: string) {
    const newSelection = new Set(selectedExperimentIds.value)
    
    if (newSelection.has(experimentId)) {
      newSelection.delete(experimentId)
    } else {
      newSelection.add(experimentId)
    }
    
    selectedExperimentIds.value = newSelection
    
    // Clear metric selections when experiment selection changes
    selectedMetrics.value.clear()
  }

  function selectAllExperiments() {
    selectedExperimentIds.value = new Set(experiments.value.map(exp => exp.id))
    selectedMetrics.value.clear()
  }

  function clearExperimentSelection() {
    selectedExperimentIds.value.clear()
    selectedMetrics.value.clear()
  }

  function toggleMetric(metricName: string) {
    const newSelection = new Set(selectedMetrics.value)
    
    if (newSelection.has(metricName)) {
      newSelection.delete(metricName)
    } else {
      newSelection.add(metricName)
    }
    
    selectedMetrics.value = newSelection
  }

  function selectAllMetrics() {
    selectedMetrics.value = new Set(availableMetricsForSelection.value)
  }

  function clearMetricSelection() {
    selectedMetrics.value.clear()
  }

  function clearSelections() {
    selectedExperimentIds.value.clear()
    selectedMetrics.value.clear()
    metricFilter.value = ''
  }

  function clearData() {
    experiments.value = []
    clearSelections()
    uploadStatus.value = {
      loading: false,
      error: null,
      success: false
    }
  }

  function exportSelectedData() {
    const selectedData: ExperimentData[] = []
    
    selectedExperimentIds.value.forEach(expId => {
      const experiment = experiments.value.find(exp => exp.id === expId)
      if (!experiment) return

      const filteredData = experiment.data.filter(d => 
        selectedMetrics.value.size === 0 || selectedMetrics.value.has(d.metric_name)
      )
      
      selectedData.push(...filteredData)
    })

    if (selectedData.length > 0) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      exportToCsv(selectedData, `experiment_data_${timestamp}.csv`)
      return true
    }
    
    return false
  }

  function setMetricFilter(filter: string) {
    metricFilter.value = filter
  }

  // Save/Load session state
  function saveSessionState() {
    const state = {
      selectedExperimentIds: Array.from(selectedExperimentIds.value),
      selectedMetrics: Array.from(selectedMetrics.value),
      metricFilter: metricFilter.value
    }
    
    localStorage.setItem('ml-experiment-viewer-session', JSON.stringify(state))
  }

  function loadSessionState() {
    try {
      const saved = localStorage.getItem('ml-experiment-viewer-session')
      if (saved) {
        const state = JSON.parse(saved)
        selectedExperimentIds.value = new Set(state.selectedExperimentIds || [])
        selectedMetrics.value = new Set(state.selectedMetrics || [])
        metricFilter.value = state.metricFilter || ''
      }
    } catch (error) {
      console.warn('Failed to load session state:', error)
    }
  }

  return {
    // State
    experiments,
    selectedExperimentIds,
    selectedMetrics,
    uploadStatus,
    metricFilter,
    
    // Getters
    allMetrics,
    availableMetricsForSelection,
    filteredMetrics,
    chartData,
    totalDataPoints,
    selectedExperiments,
    
    // Actions
    uploadCsvFile,
    toggleExperiment,
    selectAllExperiments,
    clearExperimentSelection,
    toggleMetric,
    selectAllMetrics,
    clearMetricSelection,
    clearSelections,
    clearData,
    exportSelectedData,
    setMetricFilter,
    saveSessionState,
    loadSessionState
  }
})