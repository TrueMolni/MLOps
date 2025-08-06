import Papa from "papaparse";
import type { ExperimentData, ParsedExperiment } from "@/types/experiment";

export interface ParseResult {
  success: boolean;
  data: ParsedExperiment[];
  error?: string;
  totalRows?: number;
}

const REQUIRED_COLUMNS = ["experiment_id", "metric_name", "step", "value"];

function createError(message: string): ParseResult {
  return { success: false, data: [], error: message };
}

function validateHeaders(headers: string[]): string | null {
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  return missing.length > 0
    ? `Missing required columns: ${missing.join(", ")}`
    : null;
}

function parseNumberField(
  value: any,
  rowIndex: number,
  fieldName: string
): number | string {
  const num = Number(value);
  if (isNaN(num) || (fieldName === "step" && num < 0)) {
    return `Row ${rowIndex}: ${fieldName} must be a ${
      fieldName === "step" ? "non-negative" : "valid"
    } number`;
  }
  return num;
}

function validateAndNormalizeRow(
  row: any,
  rowIndex: number
): ExperimentData | string {
  if (!row.experiment_id || typeof row.experiment_id !== "string") {
    return `Row ${rowIndex}: experiment_id must be a non-empty string`;
  }

  if (!row.metric_name || typeof row.metric_name !== "string") {
    return `Row ${rowIndex}: metric_name must be a non-empty string`;
  }

  const step = parseNumberField(row.step, rowIndex, "step");
  if (typeof step === "string") return step;

  const value = parseNumberField(row.value, rowIndex, "value");
  if (typeof value === "string") return value;

  return {
    experiment_id: row.experiment_id,
    metric_name: row.metric_name,
    step,
    value,
  };
}

function processData(rows: any[]): {
  data: ParsedExperiment[];
  error?: string;
} {
  const experiments = new Map<string, ParsedExperiment>();

  for (let i = 0; i < rows.length; i++) {
    const result = validateAndNormalizeRow(rows[i], i + 1);
    if (typeof result === "string") {
      return { data: [], error: result };
    }

    const dataPoint = result;
    if (!experiments.has(dataPoint.experiment_id)) {
      experiments.set(dataPoint.experiment_id, {
        id: dataPoint.experiment_id,
        metrics: new Set(),
        data: [],
      });
    }

    const experiment = experiments.get(dataPoint.experiment_id)!;
    experiment.metrics.add(dataPoint.metric_name);
    experiment.data.push(dataPoint);
  }

  // Sort by step
  experiments.forEach((exp) => {
    exp.data.sort((a, b) => a.step - b.step);
  });

  return { data: Array.from(experiments.values()) };
}

export function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      transform: (v: string) => v.trim(),
      complete: (results) => {
        try {
          const headers = results.meta.fields ?? [];
          const headerError = validateHeaders(headers);
          if (headerError) {
            return resolve(createError(headerError));
          }

          if (!results.data || results.data.length === 0) {
            return resolve(
              createError("CSV file is empty or contains no valid data")
            );
          }

          const { data, error } = processData(results.data);
          if (error) {
            return resolve(createError(error));
          }

          resolve({
            success: true,
            data,
            totalRows: data.reduce((sum, exp) => sum + exp.data.length, 0),
          });
        } catch (e) {
          resolve(
            createError(
              `Failed to parse CSV: ${
                e instanceof Error ? e.message : "Unknown error"
              }`
            )
          );
        }
      },
      error: (error) => {
        resolve(createError(`Failed to read CSV file: ${error.message}`));
      },
    });
  });
}

export function exportToCsv(
  data: ExperimentData[],
  filename: string = "experiment_data.csv"
): void {
  const csv = Papa.unparse(data, {
    header: true,
    columns: REQUIRED_COLUMNS,
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
