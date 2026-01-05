<script setup lang="ts">
import { ref, defineProps, defineModel, watchEffect } from 'vue'
import { useToast } from 'primevue/usetoast'
import dayjs from 'dayjs';
import type { AlgaStepLog, AlgaStepStatus } from '@/_/models/alga-process.model.ts'
import AlgaProcessService from '@/services/alga-process.service'

const service = new AlgaProcessService()

const visible = defineModel('visible', { type: Boolean, default: false })
const props = defineProps<{ processId?: number | null }>()

const toast = useToast()

const timelineItems = ref<AlgaStepLog[]>([])
const detailsVisible = ref(false)
const selectedDetails = ref('')
const loading = ref(false)

const stateColor: Record<AlgaStepStatus, string> = {
  SUCCESS:     'var(--p-green-500)',
  ERROR:       'var(--p-red-500)',
  IN_PROGRESS: 'var(--p-yellow-500)',
  UNKNOWN:     'var(--p-surface-500)',
}

const stateIcon: Record<AlgaStepStatus, string> = {
  SUCCESS: 'pi pi-check',
  ERROR: 'pi pi-times',
  IN_PROGRESS: 'pi pi-spin pi-cog',
}

async function fetchTimelineItems() {
  if (!props.processId) return

  loading.value = true
  try {
    const { logs = [] } = await service.getHistoryById(props.processId)
    timelineItems.value = logs
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка при получении истории',
      life: 2000
    })
    timelineItems.value = []
  } finally {
    loading.value = false
  }
}

function showDetails(details = '') {
  if (!details) return
  selectedDetails.value = details
  detailsVisible.value = true
}

function copyDetails(text = '') {
  if (!text) return
  navigator.clipboard.writeText(text).then(() =>
      toast.add({ severity: 'success', summary: 'Скопировано', life: 1500 })
  )
}

function fmtDateTime(dateStr?: string | null): string {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss') : '-';
}

function fmtDur(ms?: number | null): string {
  if (ms == null || ms < 0) return '-';
  const sec = ms / 1000;
  return `${sec.toFixed(1)}s`;
}

watchEffect(() => {
  if (visible.value && props.processId != null) {
    fetchTimelineItems()
  }
})
</script>

<template>
  <Dialog v-model:visible="visible"
          header="История процесса"
          modal style="width:70vw">
    <ProgressBar v-if="loading"  mode="indeterminate" style="height: 6px"></ProgressBar>

    <Timeline v-else-if="timelineItems && timelineItems.length > 0" :value="timelineItems" align="alternate">
      <template #content="{ item }: { item: AlgaStepLog }">
        <div class="timeline-entry">
          <div class="entry-header">
            <i :class="stateIcon[item.status]" :style="{ color: stateColor[item.status], marginRight: '0.3rem' }" />
            <b :style="{ color: stateColor[item.status] }">{{ item.name }}</b>
          </div>


          <div v-if="item.errorMessage" class="err-block">
            <p class="err">{{ item.errorMessage }}</p>
          </div>

          <div class="entry-footer">
            <Button v-if="item.errorDetails"
                    icon="pi pi-info-circle"
                    label="Детали"
                    size="small"
                    text
                    class="detail-btn"
                    :style="{ color: stateColor[item.status] }"
                    @click="showDetails(item.errorDetails)" />
          </div>
            <small class="ts">
              {{ fmtDateTime(item.start) }}
              <template v-if="item.end"> → {{ fmtDateTime(item.end) }}</template>
              ({{ fmtDur(item.durationMillis) }})
            </small>
        </div>
      </template>
    </Timeline>
    <div v-else class="empty-wrapper">
      <Message
          severity="secondary"
          icon="pi pi-history"
          variant="simple"
      >
        История пуста
      </Message>
    </div>
  </Dialog>
  <Dialog v-model:visible="detailsVisible"
          header="Подробности ошибки"
          modal style="width:60vw">
    <pre class="details">{{ selectedDetails }}</pre>

    <template #footer>
      <Button label="Скопировать" icon="pi pi-copy" @click="copyDetails(selectedDetails)" />
    </template>
  </Dialog>
</template>

<style scoped>
.timeline-entry  { display:flex; flex-direction:column; gap:0.35rem; max-width:100%; }
.p-timeline-event:nth-child(odd)  .timeline-entry { margin-left: auto; }  /* левая колонка  */
.p-timeline-event:nth-child(even) .timeline-entry { margin-right: auto; } /* правая колонка */

.err      { color: var(--p-red-500); font-size:0.85rem; white-space:pre-line; margin:0; }
.ts       { color:gray; font-size:0.75rem; }
.details  { white-space:pre-wrap; word-break:break-all; }
.detail-btn.p-button-text { padding:0; }
.empty-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
