<template>
  <div class="space-y-4">
    <!-- Progress Bar -->
    <div class="bg-black/30 rounded-full h-4 overflow-hidden">
      <div 
        class="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000 ease-out"
        :style="{ width: progressPercentage + '%' }"
      ></div>
    </div>
    
    <!-- Progress Text -->
    <div class="text-center">
      <p class="text-white/80 text-sm">
        Progression vers la sobriété : <strong>{{ progressPercentage.toFixed(1) }}%</strong>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { TimerData } from '../types'

interface Props {
  timerData: TimerData
}

const props = defineProps<Props>()
const currentTime = ref(new Date())
let timeInterval: number | null = null

const progressPercentage = computed(() => {
  const now = currentTime.value
  const start = props.timerData.lastSipTime
  const end = props.timerData.targetTime
  
  const totalDuration = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  
  if (totalDuration <= 0) return 100
  
  const progress = (elapsed / totalDuration) * 100
  return Math.min(100, Math.max(0, progress))
})

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>