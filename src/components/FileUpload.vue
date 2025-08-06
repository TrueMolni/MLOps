<template>
  <Card class="mb-6">
    <template #title>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-upload text-primary"></i>
        <span>Upload CSV File</span>
      </div>
    </template>
    
    <template #content>
      <div class="upload-container">
        <!-- Drag & Drop Zone -->
        <div 
          class="dropzone"
          :class="{ 
            'dropzone-active': isDragActive,
            'dropzone-error': uploadStatus.error,
            'dropzone-success': uploadStatus.success
          }"
          @drop="onDrop"
          @dragover="onDragOver"
          @dragenter="onDragEnter"
          @dragleave="onDragLeave"
          @click="triggerFileInput"
        >
          <div class="dropzone-content">
            <div v-if="uploadStatus.loading" class="text-center">
              <ProgressSpinner 
                style="width: 50px; height: 50px" 
                strokeWidth="4"
                fill="transparent"
                animationDuration=".8s"
              />
              <p class="mt-3 mb-0 text-600">Processing file...</p>
            </div>
            
            <div v-else-if="uploadStatus.success" class="text-center">
              <i class="pi pi-check-circle text-success text-6xl mb-3"></i>
              <h4 class="text-success mb-2">File uploaded successfully!</h4>
              <p class="text-600 mb-3">
                Loaded {{ experimentsCount }} experiments with {{ totalRows }} data points
              </p>
              <div class="flex gap-2 justify-content-center">
                <Button 
                  label="Upload Another File" 
                  icon="pi pi-upload"
                  outlined
                  size="small"
                  @click="clearAndUpload"
                />
              </div>
            </div>
            
            <div v-else class="text-center">
              <i class="pi pi-cloud-upload text-primary text-6xl mb-3"></i>
              <h4 class="mb-2">Drop your CSV file here</h4>
              <p class="text-600 mb-3">
                or <strong>click to browse</strong> files
              </p>
              <p class="text-sm text-500 mb-3">
                Required columns: experiment_id, metric_name, step, value
              </p>
              <Button 
                label="Browse Files" 
                icon="pi pi-folder-open"
                outlined
                size="small"
              />
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <Message 
          v-if="uploadStatus.error" 
          severity="error" 
          :closable="true"
          class="mt-3"
          @close="clearError"
        >
          <strong>Upload Error:</strong> {{ uploadStatus.error }}
        </Message>

        <!-- Sample Data Link -->
        <div v-if="!uploadStatus.success" class="mt-4 text-center">
          <p class="text-sm text-600 mb-2">Need sample data?</p>
          <Button 
            label="Load Sample CSV (25k rows)"
            icon="pi pi-download"
            text
            size="small"
            @click="loadSampleData"
            :loading="loadingSample"
          />
        </div>

        <!-- Hidden File Input -->
        <input 
          ref="fileInput"
          type="file"
          accept=".csv"
          style="display: none"
          @change="onFileSelect"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { useExperimentStore } from '@/store/experimentStore'

const toast = useToast()
const experimentStore = useExperimentStore()

const fileInput = ref<HTMLInputElement>()
const isDragActive = ref(false)
const loadingSample = ref(false)
const experimentsCount = ref(0)
const totalRows = ref(0)

const uploadStatus = computed(() => experimentStore.uploadStatus)

function triggerFileInput() {
  if (!uploadStatus.value.loading) {
    fileInput.value?.click()
  }
}

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragActive.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  if (!e.relatedTarget) {
    isDragActive.value = false
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

async function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragActive.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await handleFile(files[0])
  }
}

async function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await handleFile(files[0])
  }
}

async function handleFile(file: File) {
  // Validate file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    toast.add({
      severity: 'error',
      summary: 'Invalid File Type',
      detail: 'Please select a CSV file',
      life: 5000
    })
    return
  }

  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    toast.add({
      severity: 'error',
      summary: 'File Too Large',
      detail: 'File size must be less than 50MB',
      life: 5000
    })
    return
  }

  const result = await experimentStore.uploadCsvFile(file)
  
  if (result.success) {
    experimentsCount.value = result.experimentsCount || 0
    totalRows.value = result.totalRows || 0
    
    toast.add({
      severity: 'success',
      summary: 'File Uploaded',
      detail: `Successfully loaded ${result.experimentsCount} experiments`,
      life: 3000
    })
  } else {
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: result.error || 'Unknown error occurred',
      life: 8000
    })
  }

  // Clear file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function loadSampleData() {
  loadingSample.value = true
  
  try {
    const response = await fetch('https://dfstudio-dev-bucket.fra1.digitaloceanspaces.com/logs_25k.csv')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sample data: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const file = new File([blob], 'logs_25k.csv', { type: 'text/csv' })
    
    await handleFile(file)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Failed to Load Sample Data',
      detail: error instanceof Error ? error.message : 'Network error occurred',
      life: 5000
    })
  } finally {
    loadingSample.value = false
  }
}

function clearAndUpload() {
  experimentStore.clearData()
  triggerFileInput()
}

function clearError() {
  experimentStore.uploadStatus.error = null
}
</script>

<style scoped>
.upload-container {
  max-width: 600px;
  margin: 0 auto;
}

.dropzone {
  border: 2px dashed var(--p-primary-color);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--p-surface-50);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropzone:hover {
  border-color: var(--p-primary-500);
  background: var(--p-primary-50);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
}

.dropzone-active {
  border-color: var(--p-primary-600);
  background: var(--p-primary-100);
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
}

.dropzone-error {
  border-color: var(--p-red-500);
  background: var(--p-red-50);
}

.dropzone-success {
  border-color: var(--p-green-500);
  background: var(--p-green-50);
}

.dropzone-content {
  width: 100%;
}

@media (max-width: 768px) {
  .dropzone {
    padding: 2rem 1rem;
    margin: 0 1rem;
  }
}
</style>