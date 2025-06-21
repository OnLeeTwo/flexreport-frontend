<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Template } from '../types/types'
import { useConfirm } from 'primevue/useconfirm'
import { Button, useToast } from 'primevue'
import { exportToExcel } from '../utils/exportToExcel'
import { exportToPDF } from '../utils/exportToPDF'

import api from '../lib/axios'

const confirm = useConfirm()
const toast = useToast()

const templates = ref<Template[]>([])
const selectedTemplateIds = ref<number[]>([])
const fileFormat = ref<'pdf' | 'xlsx'>('pdf')
const isGenerating = ref(false)
const loading = ref(false)

const selectedCount = computed(() => selectedTemplateIds.value.length)
const canSubmit = computed(() => selectedCount.value > 0 && !isGenerating.value)

onMounted(async () => {
  await loadTemplates()
})

const loadTemplates = async () => {
  try {
    loading.value = true
    const res = await api.get<Template[]>('/templates')
    templates.value = res.data
  } catch (err) {
    console.error('Failed to load templates', err)
  } finally {
    loading.value = false
  }
}

const generateReports = async () => {
  if (!canSubmit.value) return

  isGenerating.value = true
  const selectedTemplates = templates.value.filter((t) => selectedTemplateIds.value.includes(t.id))

  for (const template of selectedTemplates) {
    try {
      const { data } = await api.post('/reports/generate', {
        table: template.table_name,
        columns: template.columns,
        filters: template.filters,
      })

      const filename = `${template.name}.${fileFormat.value}`
      if (fileFormat.value === 'xlsx') {
        exportToExcel(data, filename)
      } else {
        exportToPDF(data, filename)
      }
    } catch (error) {
      console.error(`Failed to generate report for ${template.name}`, error)
      alert(`Failed to generate report for ${template.name}`)
    }
  }

  isGenerating.value = false
}

const confirmDeleteTemplate = (template: Template) => {
  confirm.require({
    message: `Are you sure you want to delete "${template.name}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/templates/${template.id}`)
        await loadTemplates()
        selectedTemplateIds.value = selectedTemplateIds.value.filter((id) => id !== template.id)
        toast.add({
          severity: 'success',
          summary: 'Template Deleted',
          detail: `Template "${template.name}" has been deleted.`,
        })
      } catch (error) {
        console.error('Failed to delete template', error)
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: `Failed to delete template "${template.name}". Please check your connection and try again.`,
        })
      }
    },
  })
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-4 min-h-full">
    <h1 class="text-xl font-bold">Generate Reports</h1>

    <div v-if="loading" class="text-center text-blue-600">Loading templates...</div>

    <div v-else-if="templates.length === 0" class="text-gray-500 py-8 text-center">
      No templates found.
    </div>

    <form v-else @submit.prevent="generateReports" class="space-y-4">
      <!-- Template Selection -->
      <div class="border rounded-lg p-3">
        <h2 class="font-medium mb-2">Select Templates ({{ selectedCount }})</h2>
        <div class="space-y-1 max-h-48 overflow-y-auto">
          <label
            v-for="template in templates"
            :key="template.id"
            class="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              :value="template.id"
              v-model="selectedTemplateIds"
              class="rounded"
            />
            <span class="text-sm">
              <strong>{{ template.name }}</strong>
              <span class="text-gray-500">({{ template.table_name }})</span>
            </span>
            <Button
              @click="confirmDeleteTemplate(template)"
              severity="danger"
              size="small"
              class="p-button-rounded p-button-text ml-auto"
              icon="pi pi-trash"
              label="Delete"
            />
          </label>
        </div>
      </div>

      <!-- Format & Submit -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label for="fileFormat" class="text-sm font-medium">Format:</label>
          <select id="fileFormat" v-model="fileFormat" class="px-2 py-1 border rounded text-sm">
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel</option>
          </select>
        </div>

        <button
          type="submit"
          :disabled="!canSubmit"
          class="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{
            isGenerating
              ? 'Generating...'
              : `Download ${selectedCount} Report${selectedCount !== 1 ? 's' : ''}`
          }}
        </button>
      </div>
    </form>
  </div>
</template>
