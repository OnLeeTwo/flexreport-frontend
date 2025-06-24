<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import api from '../lib/axios'
import { Column } from '../types/types'
import {
  Button,
  Checkbox,
  DatePicker,
  InputText,
  ProgressSpinner,
  useToast,
  MultiSelect,
} from 'primevue'

const toast = useToast()

const columns = ref<Column[]>([])
const filters = ref<Record<string, any>>({})
const selectedColumns = ref<string[]>([])
const columnOptions = ref<Record<string, string[]>>({})
const templateName = ref<string>('')
const loading = ref<boolean>(false)
const dropdownLoading = ref<Record<string, boolean>>({})

// Fetch columns on component mount
onMounted(async () => {
  loading.value = true
  try {
    const res = await api.get<Column[]>('/reports/columns/sales_data')
    columns.value = res.data

    // Initialize filters structure
    for (const col of res.data) {
      if (col.data_type === 'text' || col.data_type === 'boolean') {
        filters.value[col.column_name] = null
      } else if (col.data_type === 'bigint') {
        filters.value[col.column_name] = { min: null, max: null }
      } else if (col.data_type === 'date') {
        filters.value[col.column_name] = { range: null}
      }
    }
  } catch (error) {
    console.error('Error fetching columns:', error)
  } finally {
    loading.value = false
  }
})

// Fetch column values when dropdown is clicked
const loadColumnOptions = async (columnName: string) => {
  if (columnOptions.value[columnName] || dropdownLoading.value[columnName]) {
    return // Already loaded or loading
  }

  dropdownLoading.value[columnName] = true
  try {
    const valRes = await api.get<string[]>(`/reports/column-values/sales_data/${columnName}`)
    columnOptions.value[columnName] = valRes.data
  } catch (error) {
    console.error(`Error fetching options for ${columnName}:`, error)
    columnOptions.value[columnName] = []
  } finally {
    dropdownLoading.value[columnName] = false
  }
}

// Submit the template
const saveTemplate = async () => {
  if (!templateName.value.trim()) {
    return
  }

  loading.value = true
  try {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters.value).filter(([_, v]) => {
        if (v === null || v === undefined) return false
        if (typeof v === 'object' && v !== null) {
          return Object.values(v).some((val) => val !== null && val !== undefined)
        }
        return true
      }),
    )

    await api.post('/templates', {
      name: templateName.value.trim(),
      table_name: 'sales_data',
      columns: selectedColumns.value,
      filters: cleanedFilters,
    })

    // Reset form
    templateName.value = ''
    selectedColumns.value = []
    Object.keys(filters.value).forEach((key) => {
      const col = columns.value.find((c) => c.column_name === key)
      if (col?.data_type === 'text' || col?.data_type === 'boolean') {
        filters.value[key] = null
      } else if (col?.data_type === 'bigint') {
        filters.value[key] = { min: null, max: null }
      } else if (col?.data_type === 'date') {
        filters.value[key] = { range: null, }
      }
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Template saved successfully!',
      life: 3000,
    })
  } catch (error) {
    console.error('Error saving template:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save template. Please try again.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Format column name for display
const formatColumnName = (columnName: string) => {
  return columnName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <div class="surface-ground h-screen overflow-hidden">
    <div class="h-full flex flex-column min-h-0">
      <!-- Compact Header -->
      <div class="surface-card border-round-lg shadow-2 mx-4 my-2 px-4 py-2 flex-shrink-0">
        <div class="flex align-items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-900 m-0 mb-1">Template Builder</h1>
          </div>
          <div class="flex align-middle gap-3">
            <!-- Template Name Input -->
            <div class="field m-0">
              <label for="templateName" class="block text-900 font-medium mb-1 text-sm">
                Template Name <span class="text-red-500">*</span>
              </label>
              <InputText
                id="templateName"
                v-model="templateName"
                placeholder="Enter template name"
                class="w-16rem"
                :class="{ 'p-invalid': !templateName.trim() }"
              />
            </div>
            <!-- Save Button -->
            <Button
              label="Save Template"
              icon="pi pi-save"
              :loading="loading"
              :disabled="!templateName.trim() || selectedColumns.length === 0"
              @click="saveTemplate"
              class="mt-4"
              size="small"
            />
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="flex align-items-center gap-4 mt-3 py-2 border-top-1 surface-border">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-table text-primary"></i>
            <span class="text-sm"
              ><strong>{{ selectedColumns.length }}</strong> Selected Columns</span
            >
          </div>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-filter text-primary"></i>
            <span class="text-sm"
              ><strong>
                {{
                  Object.values(filters).filter((v) => {
                    if (v === null || v === undefined) return false
                    if (typeof v === 'object' && v !== null) {
                      return Object.values(v).some((val) => val !== null && val !== undefined)
                    }
                    return true
                  }).length
                }}
              </strong>
              Active Filters</span
            >
          </div>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-database text-primary"></i>
            <span class="text-sm"
              ><strong>{{ columns.length }}</strong> Total Columns</span
            >
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading && columns.length === 0"
        class="flex-1 flex align-items-center justify-content-center"
      >
        <div class="flex align-items-center">
          <ProgressSpinner
            style="width: 40px; height: 40px"
            strokeWidth="3"
            animationDuration="1s"
          />
          <span class="ml-3 text-600">Loading columns...</span>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="flex-1 overflow-hidden min-h-0">
        <div class="flex h-full mx-4 mb-2 mt-1 gap-3">
          <!-- Left Panel - Selection Criteria -->
          <div class="flex-1" style="flex-basis: 75%">
            <div class="surface-card border-round-lg shadow-2 h-full flex flex-column min-h-0">
              <div class="p-4 pb-2 flex-shrink-0">
                <div class="flex align-items-center gap-2 mb-2">
                  <i class="pi pi-filter text-primary"></i>
                  <h2 class="text-lg font-semibold text-900 m-0">Selection Criteria</h2>
                </div>
              </div>

              <div class="flex-1 overflow-auto px-4 pb-4 min-h-0">
                <div class="filters-container">
                  <div v-for="col in columns" :key="col.column_name" class="filter-item">
                    <p class="block text-900 font-medium text-xs mb-1">
                      {{ formatColumnName(col.column_name) }}
                    </p>

                    <!-- TEXT & BOOLEAN → Dropdown -->
                    <MultiSelect
                      v-if="col.data_type === 'text' || col.data_type === 'boolean'"
                      v-model="filters[col.column_name]"
                      :options="columnOptions[col.column_name] || []"
                      placeholder="Select value"
                      display="comma"
                      showClear
                      filter
                      size="small"
                      class="w-full text-sm"
                      :loading="dropdownLoading[col.column_name]"
                      @click="loadColumnOptions(col.column_name)"
                      @show="loadColumnOptions(col.column_name)"
                    />

                    <!-- BIGINT → Range -->
                    <div v-else-if="col.data_type === 'bigint'" class="flex gap-2">
                      <input
                        type="number"
                        v-model.number="filters[col.column_name].min"
                        placeholder="Min"
                        class="flex-1 p-inputtext text-sm border border-gray-300 rounded px-3 py-2 w-1/2"
                      />
                      <input
                        type="number"
                        v-model.number="filters[col.column_name].max"
                        placeholder="Max"
                        class="flex-1 p-inputtext text-sm border border-gray-300 rounded px-3 py-2 w-1/2"
                      />
                    </div>

                    <!-- DATE → Range -->
                    <div v-else-if="col.data_type === 'date'">
                      <DatePicker
                        v-model="filters[col.column_name].range"
                        placeholder="Select date range"
                        showIcon
                        size="small"
                        selection-mode="range"
                        dateFormat="yy-mm-dd"
                        class="w-full text-sm"
                        showButtonBar
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel - Field Selection -->
          <div class="flex-shrink-0" style="width: 25%">
            <div class="surface-card border-round-lg shadow-2 h-full flex flex-column min-h-0">
              <div class="p-3 pb-2 flex-shrink-0">
                <div class="flex align-items-center justify-between mb-2">
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-table text-primary"></i>
                    <h2 class="text-base font-semibold text-900 m-0">Field Selection</h2>
                  </div>
                  <!-- Quick Actions -->
                  <div class="flex gap-1">
                    <Button
                      label="All"
                      icon="pi pi-check"
                      severity="secondary"
                      size="small"
                      text
                      @click="selectedColumns = columns.map((c) => c.column_name)"
                    />
                    <Button
                      label="None"
                      icon="pi pi-times"
                      severity="secondary"
                      size="small"
                      text
                      @click="selectedColumns = []"
                    />
                  </div>
                </div>
              </div>

              <div class="flex-1 overflow-auto px-3 pb-3 min-h-0">
                <div class="checkbox-container-compact">
                  <div
                    v-for="col in columns"
                    :key="'cb-' + col.column_name"
                    class="checkbox-item-compact"
                  >
                    <Checkbox
                      v-model="selectedColumns"
                      :inputId="'cb-' + col.column_name"
                      :value="col.column_name"
                    />
                    <label :for="'cb-' + col.column_name" class="ml-2 text-xs leading-tight">
                      {{ formatColumnName(col.column_name) }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Left Panel - Filters Container */
.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  padding: 0.5rem 0;
}

.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Important for proper text wrapping */
}

/* Right Panel - Checkbox Container */
.checkbox-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.checkbox-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 0.85rem;
  line-height: 1.1;
  min-height: 2.5rem;
}

.checkbox-item:hover {
  background-color: var(--surface-hover);
  border-color: var(--primary-color);
}

/* Compact Right Panel - Checkbox Container */
.checkbox-container-compact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.25rem 0;
}

.checkbox-item-compact {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.375rem;
  border: 1px solid var(--surface-border);
  border-radius: 3px;
  transition: all 0.2s;
  font-size: 0.75rem;
  line-height: 1;
  min-height: 1.75rem;
  word-break: break-word;
}

.checkbox-item-compact:hover {
  background-color: var(--surface-hover);
  border-color: var(--primary-color);
}

.checkbox-item-compact label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.surface-ground {
  background-color: var(--surface-ground);
}

/* Custom scrollbar for better appearance */
:deep(.overflow-auto::-webkit-scrollbar) {
  width: 6px;
}

:deep(.overflow-auto::-webkit-scrollbar-track) {
  background: var(--surface-ground);
  border-radius: 3px;
}

:deep(.overflow-auto::-webkit-scrollbar-thumb) {
  background: var(--surface-border);
  border-radius: 3px;
}

:deep(.overflow-auto::-webkit-scrollbar-thumb:hover) {
  background: var(--primary-color);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .filters-container {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .checkbox-container-compact {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
  }

  .flex {
    flex-direction: column;
  }

  .flex-1[style*='flex-basis'],
  .flex-shrink-0[style*='width'] {
    flex-basis: auto !important;
    width: 100% !important;
  }

  .checkbox-container-compact {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
