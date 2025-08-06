export interface ExperimentData {
  experiment_id: string
  metric_name: string
  step: number
  value: number
}

export interface ParsedExperiment {
  id: string
  metrics: Set<string>
  data: ExperimentData[]
}

export interface ChartDataPoint {
  x: number
  y: number
  experimentId: string
  metricName: string
}

export interface MetricSeries {
  experimentId: string
  metricName: string
  data: { step: number; value: number }[]
}

export interface UploadStatus {
  loading: boolean
  error: string | null
  success: boolean
}